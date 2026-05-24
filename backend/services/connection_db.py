import psycopg2
from psycopg2 import OperationalError
from psycopg2 import errors as pg_errors
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from pydantic import BaseModel
import os
from fastapi import HTTPException
import bcrypt

class User(BaseModel):
    nome: str
    email: str
    senha: str

class Child(BaseModel):
    username: str
    senha: str
    idResponsavel: str

class Character(BaseModel):
    idPaciente: int
    nome: str

load_dotenv()

config = {
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "dbname": os.getenv("DB_NAME"),
    "port": os.getenv("DB_PORT")
}

CATEGORIAS_SAUDAVEIS = {
    "carbohydrates", "carbs", "fruits", "fruit",
    "vegetables", "veggies", "dairy", "milk",
    "proteins", "protein", "meat", "legumes", "nuts"
}

def get_db_connection():
    try:
        conn = psycopg2.connect(**config)
        return conn
    except OperationalError as err:
        raise HTTPException(status_code=400, detail=f"Erro ao conectar no banco: {str(err)}")

def register_user_service(user: User):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO Paciente (nome, email, senha, tipo)
            VALUES (%s, %s, %s, 'responsavel')
            RETURNING idPaciente
        """
        hashed_password = bcrypt.hashpw(user.senha.encode('utf-8'), bcrypt.gensalt())
        cursor.execute(query, (user.nome, user.email, hashed_password.decode('utf-8')))
        id_paciente = cursor.fetchone()[0]
        conn.commit()
        return {"success": True, "message": "Responsável registrado com sucesso", "idPaciente": id_paciente}
    except pg_errors.UniqueViolation:
        if conn: conn.rollback()
        raise HTTPException(status_code=409, detail="Este e-mail já está cadastrado.")
    except Exception as err:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()

def create_child_service(child: Child):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO Paciente (nome, username, senha, tipo, idResponsavel)
            VALUES (%s, %s, %s, 'filho', %s)
            RETURNING idPaciente
        """
        hashed_password = bcrypt.hashpw(child.senha.encode('utf-8'), bcrypt.gensalt())
        cursor.execute(query, (
            child.username,
            child.username,
            hashed_password.decode('utf-8'),
            child.idResponsavel
        ))
        id_child = cursor.fetchone()[0]
        conn.commit()
        return {"success": True, "message": "Filho criado com sucesso", "idPaciente": id_child}
    except pg_errors.UniqueViolation:
        if conn: conn.rollback()
        raise HTTPException(status_code=409, detail="Este username já está em uso.")
    except Exception as err:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()

def add_character_name_service(character: Character):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO Personagem (idPaciente, nome)
            VALUES (%s, %s)
        """
        cursor.execute(query, (character.idPaciente, character.nome))
        conn.commit()
        return {"success": True, "message": "Nome do personagem adicionado com sucesso", "nome": character.nome, "idPaciente": character.idPaciente}
    except Exception as err:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()

def login_user_service(login: str, senha: str):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        if "@" in login:
            query = """
                SELECT idPaciente, nome, tipo, senha, ativo
                FROM Paciente
                WHERE email = %s AND tipo IN ('responsavel', 'admin')
            """
            cursor.execute(query, (login,))
        else:
            query = """
                SELECT idPaciente, nome, tipo, senha, ativo
                FROM Paciente
                WHERE username = %s AND tipo = 'filho'
            """
            cursor.execute(query, (login,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        
        esta_ativo = True
        if len(user) > 4 and user[4] is False:
            esta_ativo = False

        if not esta_ativo:
            raise HTTPException(status_code=403, detail="Esta conta foi desativada pelo administrador.")
        senha_correta = bcrypt.checkpw(senha.encode('utf-8'), user[3].encode('utf-8'))

        if not senha_correta:
            raise HTTPException(status_code=401, detail="Senha incorreta")
        return {"success": True, "message": "Login bem-sucedido", "user": {"idPaciente": user[0], "nome": user[1], "tipo": user[2]}}
    except HTTPException:
        raise
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()

def verificar_e_desbloquear_conquistas(id_paciente: int, cursor, total_refeicoes: int, total_saudaveis: int):
    cursor.execute("""
        SELECT c.idconquista, c.missoes_necessarias, c.nome, c.descricao, c.icone, c.cor_fundo, c.cor_icone
        FROM conquista c
        WHERE c.idconquista NOT IN (
            SELECT pc.idconquista
            FROM pacienteconquista pc
            WHERE pc.idpaciente = %s
        )
    """, (id_paciente,))
    disponiveis = cursor.fetchall()

    novas = []
    for row in disponiveis:
        necessarias = row['missoes_necessarias']
        desbloqueou = False

        if necessarias == 0 and total_refeicoes >= 1:
            desbloqueou = True
        elif necessarias > 0 and total_saudaveis >= necessarias:
            desbloqueou = True

        if desbloqueou:
            cursor.execute("""
                INSERT INTO pacienteconquista (idpaciente, idconquista)
                VALUES (%s, %s) ON CONFLICT DO NOTHING
            """, (id_paciente, row['idconquista']))
            novas.append({
                "nome":      row['nome'],
                "descricao": row['descricao'],
                "icone":     row['icone'],
                "cor_fundo": row['cor_fundo'],
                "cor_icone": row['cor_icone'],
            })

    return novas

def save_status_to_db(id_paciente, status_data):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)  # ← RealDictCursor aqui

        classification = status_data.get('classification', '')
        eh_saudavel = classification.lower() in CATEGORIAS_SAUDAVEIS

        cursor.execute("""
            UPDATE Personagem
            SET carboidrato = LEAST(carboidrato + %s, 100),
                glicemia = LEAST(glicemia + %s, 100),
                proteina = LEAST(proteina + %s, 100),
                total_refeicoes = total_refeicoes + 1,
                total_refeicoes_saudaveis = total_refeicoes_saudaveis + %s
            WHERE idPaciente = %s
            RETURNING total_refeicoes, total_refeicoes_saudaveis
        """, (
            status_data['carboidrato'],
            status_data['glicemia'],
            status_data['proteina'],
            1 if eh_saudavel else 0,
            id_paciente
        ))

        row = cursor.fetchone()
        total_refeicoes = row['total_refeicoes'] if row else 1
        total_saudaveis = row['total_refeicoes_saudaveis'] if row else (1 if eh_saudavel else 0)

        cursor.execute("""
            INSERT INTO HistoricoSaude (idPaciente, carboidrato, glicemia, proteina, eh_saudavel)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            id_paciente,
            status_data['carboidrato'],
            status_data['glicemia'],
            status_data['proteina'],
            eh_saudavel
        ))

        novas_conquistas = verificar_e_desbloquear_conquistas(
            id_paciente, cursor, total_refeicoes, total_saudaveis
        )
        conn.commit()
        return novas_conquistas

    except Exception as err:
        if conn: conn.rollback()
        print(f"ERRO save_status_to_db: {str(err)}")  # ← log para ver o erro real
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()

def get_character_status(id_paciente: int):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            SELECT idPaciente, nome, carboidrato, glicemia, proteina
            FROM Personagem
            WHERE idPaciente = %s
        """
        cursor.execute(query, (id_paciente,))
        status = cursor.fetchone()
        if not status:
            raise HTTPException(status_code=404, detail="Status do personagem não encontrado")
        return status
    except HTTPException:
        raise
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()

def add_mission_service(id_paciente: int, missao1: int, missao2: int, missao3: int, missao4: int):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO Missoes (idPaciente, missao1, missao2, missao3, missao4)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (idPaciente) DO UPDATE
            SET missao1 = EXCLUDED.missao1,
                missao2 = EXCLUDED.missao2,
                missao3 = EXCLUDED.missao3,
                missao4 = EXCLUDED.missao4
        """
        cursor.execute(query, (id_paciente, missao1, missao2, missao3, missao4))
        conn.commit()
        return {"success": True, "message": "Missões adicionadas com sucesso", "idPaciente": id_paciente}
    except Exception as err:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()

def get_missions_service(id_paciente: int):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            SELECT missao1, missao2, missao3, missao4
            FROM Missoes
            WHERE idPaciente = %s
        """
        cursor.execute(query, (id_paciente,))
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Missões não encontradas")
        return result
    except HTTPException:
        raise
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()

def get_conquistas_service(id_paciente: int):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            SELECT
                c.idConquista,
                c.nome,
                c.descricao,
                c.icone,
                c.cor_fundo,
                c.cor_icone,
                pc.desbloqueada_em
            FROM PacienteConquista pc
            JOIN Conquista c ON pc.idConquista = c.idConquista
            WHERE pc.idPaciente = %s
            ORDER BY pc.desbloqueada_em DESC
        """
        cursor.execute(query, (id_paciente,))
        conquistas = cursor.fetchall()
        return conquistas
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor:cursor.close()
        if conn: conn.close()

def get_historico_service(id_paciente: int, periodo: str, data_ref: str = None):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        if data_ref:
            base_date_condition = "%s::timestamp"
            params_week = (id_paciente, data_ref, data_ref)
            params_month = (id_paciente, data_ref, data_ref)
        else:
            base_date_condition = "NOW()"
            params_week = (id_paciente,)
            params_month = (id_paciente,)

        if periodo == 'week':
            query = f"""
                SELECT
                    TO_CHAR(registrado_em, 'Dy') AS label,
                    DATE_TRUNC('day', registrado_em) AS dia,
                    ROUND(AVG(carboidrato)) AS carboidrato,
                    ROUND(AVG(glicemia)) AS glicemia,
                    ROUND(AVG(proteina)) AS proteina,
                    COUNT(*) AS total_refeicoes,
                    SUM(CASE WHEN eh_saudavel THEN 1 ELSE 0 END) AS refeicoes_saudaveis
                FROM HistoricoSaude
                WHERE idPaciente = %s
                    AND registrado_em >= {base_date_condition} - INTERVAL '7 days'
                    AND registrado_em <= {base_date_condition} + INTERVAL '1 day' -- Garante que pega o dia atual completo
                GROUP BY DATE_TRUNC('day', registrado_em), TO_CHAR(registrado_em, 'Dy')
                ORDER BY dia
            """
            cursor.execute(query, params_week)
            
        else:
            query = f"""
                SELECT
                    'Sem ' || TO_CHAR(registrado_em, 'W') AS label,
                    DATE_TRUNC('week', registrado_em) AS dia,
                    ROUND(AVG(carboidrato)) AS carboidrato,
                    ROUND(AVG(glicemia)) AS glicemia,
                    ROUND(AVG(proteina)) AS proteina,
                    COUNT(*) AS total_refeicoes,
                    SUM(CASE WHEN eh_saudavel THEN 1 ELSE 0 END) AS refeicoes_saudaveis
                FROM HistoricoSaude
                WHERE idPaciente = %s
                    AND registrado_em >= {base_date_condition} - INTERVAL '30 days'
                    AND registrado_em <= {base_date_condition} + INTERVAL '1 day'
                GROUP BY DATE_TRUNC('week', registrado_em), TO_CHAR(registrado_em, 'W')
                ORDER BY dia
            """
            cursor.execute(query, params_month)

        rows = cursor.fetchall()

        if not rows:
            return {
                "labels": [],
                "carboidrato": [],
                "glicemia": [],
                "proteina": [],
                "resumo": {
                    "media_carboidrato": 0,
                    "media_glicemia": 0,
                    "media_proteina": 0,
                    "total_refeicoes": 0,
                    "refeicoes_saudaveis": 0,
                }
            }

        labels       = [r['label'] for r in rows]
        carboidrato  = [float(r['carboidrato'] or 0) for r in rows]
        glicemia     = [float(r['glicemia'] or 0) for r in rows]
        proteina     = [float(r['proteina'] or 0) for r in rows]
        total        = sum(r['total_refeicoes'] for r in rows)
        saudaveis    = sum(r['refeicoes_saudaveis'] for r in rows)

        cursor.execute("""
            SELECT glicemia 
            FROM HistoricoSaude 
            WHERE idPaciente = %s 
            ORDER BY registrado_em DESC 
            LIMIT 1
        """, (id_paciente,))
        ultimo_registro = cursor.fetchone()
        glicemia_atual = float(ultimo_registro['glicemia'] or 0) if ultimo_registro else 0.0

        return {
            "labels": labels,
            "carboidrato": carboidrato,
            "glicemia": glicemia,
            "proteina": proteina,
            "glicemia_atual": glicemia_atual,
            "resumo": {
                "media_carboidrato":  round(sum(carboidrato) / len(carboidrato)),
                "media_glicemia":     round(sum(glicemia) / len(glicemia)),
                "media_proteina":     round(sum(proteina) / len(proteina)),
                "total_refeicoes":    total,
                "refeicoes_saudaveis": saudaveis,
            }
        }
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()

def get_admin_stats_service():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM Paciente WHERE tipo IN ('responsavel', 'filho') AND ativo = TRUE")
        total_ativos = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM Paciente WHERE tipo = 'responsavel' AND ativo = TRUE")
        total_responsaveis = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM Paciente WHERE tipo = 'filho' AND ativo = TRUE")
        total_filhos = cursor.fetchone()[0]
        return {"totalAtivos": total_ativos, "totalResponsaveis": total_responsaveis, "totalFilhos": total_filhos}
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()

def get_monthly_registrations_service():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                TO_CHAR(criado_em, 'Mon') AS mes,
                COUNT(*) AS total
            FROM Paciente
            WHERE tipo IN ('responsavel', 'filho')
            AND criado_em >= NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', criado_em), TO_CHAR(criado_em, 'Mon')
            ORDER BY DATE_TRUNC('month', criado_em)
        """)
        rows = cursor.fetchall()
        return {"labels": [row[0] for row in rows], "data": [row[1] for row in rows]}
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()

def get_dependents_service(id_responsavel: int):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            SELECT p.idPaciente, p.username as nomeFilho, c.nome as nomeMoscote
            FROM Paciente p
            LEFT JOIN Personagem c ON p.idPaciente = c.idPaciente
            WHERE p.idResponsavel = %s AND p.tipo = 'filho'
        """
        cursor.execute(query, (id_responsavel,))
        dependents = cursor.fetchall()
        return dependents
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()

def get_all_users_admin_service():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            SELECT
                idPaciente AS id,
                nome,
                COALESCE(email, username) AS contato,
                tipo,
                ativo AS is_active
            FROM Paciente
            WHERE tipo IN ('responsavel', 'filho')
            ORDER BY criado_em DESC
        """
        cursor.execute(query)
        users = cursor.fetchall()
        return users
    except Exception as err:
        print(f"ERRO CRÍTICO NO BANCO: {str(err)}")
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()

def toggle_user_status_service(user_id: int, is_active: bool):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            UPDATE Paciente
            SET ativo = %s
            WHERE idPaciente = %s
        """
        cursor.execute(query, (is_active, user_id))
        conn.commit()
        return {"success": True, "message": f"Status do usuário alterado para {is_active}"}
    except Exception as err:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()