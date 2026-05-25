import psycopg2
from psycopg2 import OperationalError
from psycopg2 import errors as pg_errors
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from pydantic import BaseModel
import os
from fastapi import HTTPException
import bcrypt
import secrets
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta

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
        return {
            "success": True,
            "message": "Responsável registrado com sucesso",
            "idPaciente": id_paciente
        }
    except pg_errors.UniqueViolation:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=409, detail="Este e-mail já está cadastrado.")
    except Exception as err:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

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
        hashed_password = bcrypt.hashpw(
            child.senha.encode('utf-8'),
            bcrypt.gensalt()
        )
        cursor.execute(query, (
            child.username,
            child.username,
            hashed_password.decode('utf-8'),
            child.idResponsavel
        ))
        id_child = cursor.fetchone()[0]
        conn.commit()
        return {
            "success": True,
            "message": "Filho criado com sucesso",
            "idPaciente": id_child
        }
    except pg_errors.UniqueViolation:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=409, detail="Este username já está em uso.")
    except Exception as err:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

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
        return {
            "success": True,
            "message": "Nome do personagem adicionado com sucesso",
            "nome": character.nome,
            "idPaciente": character.idPaciente
        }
    except Exception as err:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def login_user_service(login: str, senha: str):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        if "@" in login:
            query = """
                SELECT idPaciente, nome, tipo, senha
                FROM Paciente
                WHERE email = %s
                AND tipo IN ('responsavel', 'admin')
            """
            cursor.execute(query, (login,))
        else:
            query = """
                SELECT idPaciente, nome, tipo, senha
                FROM Paciente
                WHERE username = %s
                AND tipo = 'filho'
            """
            cursor.execute(query, (login,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        senha_hash = user[3]
        senha_correta = bcrypt.checkpw(
            senha.encode('utf-8'),
            senha_hash.encode('utf-8')
        )
        if not senha_correta:
            raise HTTPException(status_code=401, detail="Senha incorreta")
        return {
            "success": True,
            "message": "Login bem-sucedido",
            "user": {
                "idPaciente": user[0],
                "nome": user[1],
                "tipo": user[2]
            }
        }
    except HTTPException:
        raise
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def save_status_to_db(id_paciente, status_data):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            UPDATE Personagem
            SET energia = %s,
                forca = %s,
                felicidade = %s,
                alimentacao = %s,
                xp = %s
            WHERE idPaciente = %s
        """
        data = (
            status_data['energia'],
            status_data['forca'],
            status_data['felicidade'],
            status_data['alimentacao'],
            status_data['xp'],
            id_paciente
        )
        cursor.execute(query, data)
        conn.commit()
    except Exception as err:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def get_character_status(id_paciente: int):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            SELECT nome, carboidrato, glicemia, proteina
            FROM Personagem
            WHERE idPaciente = %s
        """
        cursor.execute(query, (id_paciente,))
        status = cursor.fetchone()
        if not status:
            raise HTTPException(status_code=404, detail="Status do personagem não encontrado")
        return status
    except Exception as err:
        print(f"ERRO get_character_status id={id_paciente}: {err}")
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def add_mission_service(id_paciente: int, missao1: int, missao2: int, missao3: int, missao4: int):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO Missoes (idPaciente, missao1, missao2, missao3, missao4)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (id_paciente, missao1, missao2, missao3, missao4))
        conn.commit()
        return {
            "success": True,
            "message": "Missões adicionadas com sucesso",
            "idPaciente": id_paciente
        }
    except Exception as err:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

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
        if result:
            return result
        else:
            raise HTTPException(status_code=404, detail="Missões não encontradas")
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def get_admin_stats_service():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT COUNT(*) FROM Paciente
            WHERE tipo IN ('responsavel', 'filho')
        """)
        total_ativos = cursor.fetchone()[0]
        cursor.execute("""
            SELECT COUNT(*) FROM Paciente
            WHERE tipo = 'responsavel'
        """)
        total_reponsaveis = cursor.fetchone()[0]
        cursor.execute("""
            SELECT COUNT(*) FROM Paciente
            WHERE tipo = 'filho'
        """)
        total_filhos = cursor.fetchone()[0]
        return {
            "totalAtivos": total_ativos,
            "totalResponsaveis": total_reponsaveis,
            "totalFilhos": total_filhos
        }
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

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
        labels = [row[0] for row in rows]
        data = [row[1] for row in rows]
        return {
            "labels": labels,
            "data": data
        }
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def get_dependents_service(id_responsavel: str):
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
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def send_reset_email(to_email: str, token: str):
    msg = MIMEText(
        f"Olá!\n\n"
        f"Seu código de recuperação de senha do InSync é:\n\n"
        f"  {token}\n\n"
        f"Ele é válido por 15 minutos.\n"
        f"Se não foi você quem solicitou, ignore este e-mail."
    )
    msg['Subject'] = 'Recuperação de senha - InSync'
    msg['From'] = os.getenv('EMAIL_USER')
    msg['To'] = to_email

    with smtplib.SMTP(os.getenv('EMAIL_HOST'), int(os.getenv('EMAIL_PORT'))) as server:
        server.starttls()
        server.login(os.getenv('EMAIL_USER'), os.getenv('EMAIL_PASSWORD'))
        server.send_message(msg)

def request_password_reset_service(email: str):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT idPaciente FROM Paciente WHERE email = %s AND tipo IN ('responsavel', 'admin')",
            (email,)
        )
        user = cursor.fetchone()

        if not user:
            return {"success": True, "message": "Se o e-mail estiver cadastrado, você receberá o código."}

        token = str(secrets.randbelow(900000) + 100000)
        expires_at = datetime.utcnow() + timedelta(minutes=15)

        cursor.execute("""
            UPDATE Paciente
            SET reset_token = %s, reset_token_expires = %s
            WHERE email = %s
        """, (token, expires_at, email))
        conn.commit()

        send_reset_email(email, token)

        return {"success": True, "message": "Se o e-mail estiver cadastrado, você receberá o código."}

    except Exception as err:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def reset_password_service(email: str, token: str, nova_senha: str):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT reset_token, reset_token_expires
            FROM Paciente
            WHERE email = %s AND tipo IN ('responsavel', 'admin')
        """, (email,))
        user = cursor.fetchone()

        if not user or user[0] != token:
            raise HTTPException(status_code=400, detail="Código inválido.")

        if datetime.utcnow() > user[1]:
            raise HTTPException(status_code=400, detail="Código expirado. Solicite um novo.")

        hashed = bcrypt.hashpw(nova_senha.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        cursor.execute("""
            UPDATE Paciente
            SET senha = %s, reset_token = NULL, reset_token_expires = NULL
            WHERE email = %s
        """, (hashed, email))
        conn.commit()

        return {"success": True, "message": "Senha redefinida com sucesso."}

    except HTTPException:
        raise
    except Exception as err:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def get_conquistas_service(id_paciente: int):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            SELECT c.idConquista, c.nome, c.descricao, c.icone, c.cor_fundo, c.cor_icone, pc.desbloqueada_em
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
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def get_historico_service(id_paciente: int, periodo: str, data_ref: str):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        if periodo == 'week':
            query = """
                SELECT
                    TO_CHAR(registrado_em, 'DD/MM') AS label,
                    ROUND(AVG(carboidrato)) AS carboidrato,
                    ROUND(AVG(glicemia)) AS glicemia,
                    ROUND(AVG(proteina)) AS proteina
                FROM HistoricoSaude
                WHERE idPaciente = %s
                AND registrado_em >= %s::date - INTERVAL '6 days'
                AND registrado_em <= %s::date + INTERVAL '1 day'
                GROUP BY DATE_TRUNC('day', registrado_em), TO_CHAR(registrado_em, 'DD/MM')
                ORDER BY DATE_TRUNC('day', registrado_em)
            """
            cursor.execute(query, (id_paciente, data_ref, data_ref))
        else:
            query = """
                SELECT
                    TO_CHAR(registrado_em, 'DD/MM') AS label,
                    ROUND(AVG(carboidrato)) AS carboidrato,
                    ROUND(AVG(glicemia)) AS glicemia,
                    ROUND(AVG(proteina)) AS proteina
                FROM HistoricoSaude
                WHERE idPaciente = %s
                AND DATE_TRUNC('month', registrado_em) = DATE_TRUNC('month', %s::date)
                GROUP BY DATE_TRUNC('day', registrado_em), TO_CHAR(registrado_em, 'DD/MM')
                ORDER BY DATE_TRUNC('day', registrado_em)
            """
            cursor.execute(query, (id_paciente, data_ref))

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

        labels      = [row[0] for row in rows]
        carboidrato = [int(row[1]) for row in rows]
        glicemia    = [int(row[2]) for row in rows]
        proteina    = [int(row[3]) for row in rows]

        # resumo do período completo
        if periodo == 'week':
            cursor.execute("""
                SELECT
                    ROUND(AVG(carboidrato)) AS media_carboidrato,
                    ROUND(AVG(glicemia))    AS media_glicemia,
                    ROUND(AVG(proteina))    AS media_proteina,
                    COUNT(*)                AS total_refeicoes,
                    SUM(CASE WHEN eh_saudavel THEN 1 ELSE 0 END) AS refeicoes_saudaveis
                FROM HistoricoSaude
                WHERE idPaciente = %s
                AND registrado_em >= %s::date - INTERVAL '6 days'
                AND registrado_em <= %s::date + INTERVAL '1 day'
            """, (id_paciente, data_ref, data_ref))
        else:
            cursor.execute("""
                SELECT
                    ROUND(AVG(carboidrato)) AS media_carboidrato,
                    ROUND(AVG(glicemia))    AS media_glicemia,
                    ROUND(AVG(proteina))    AS media_proteina,
                    COUNT(*)                AS total_refeicoes,
                    SUM(CASE WHEN eh_saudavel THEN 1 ELSE 0 END) AS refeicoes_saudaveis
                FROM HistoricoSaude
                WHERE idPaciente = %s
                AND DATE_TRUNC('month', registrado_em) = DATE_TRUNC('month', %s::date)
            """, (id_paciente, data_ref))

        resumo = cursor.fetchone()

        return {
            "labels": labels,
            "carboidrato": carboidrato,
            "glicemia": glicemia,
            "proteina": proteina,
            "resumo": {
                "media_carboidrato": int(resumo[0] or 0),
                "media_glicemia":    int(resumo[1] or 0),
                "media_proteina":    int(resumo[2] or 0),
                "total_refeicoes":   int(resumo[3] or 0),
                "refeicoes_saudaveis": int(resumo[4] or 0),
            }
        }

    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()