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
                SELECT idPaciente, nome, tipo, senha
                FROM Paciente
                WHERE email = %s AND tipo IN ('responsavel', 'admin')
            """
            cursor.execute(query, (login,))
        else:
            query = """
                SELECT idPaciente, nome, tipo, senha
                FROM Paciente
                WHERE username = %s AND tipo = 'filho'
            """
            cursor.execute(query, (login,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
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

def save_status_to_db(id_paciente, status_data):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            UPDATE Personagem
            SET carboidrato = %s,
                glicemia    = %s,
                proteina    = %s,
                xp          = %s
            WHERE idPaciente = %s
        """
        cursor.execute(query, (
            status_data['carboidrato'],
            status_data['glicemia'],
            status_data['proteina'],
            status_data['xp'],
            id_paciente
        ))
        conn.commit()
    except Exception as err:
        if conn: conn.rollback()
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
            SELECT nome, carboidrato, glicemia, proteina, xp
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

def get_admin_stats_service():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM Paciente WHERE tipo IN ('responsavel', 'filho')")
        total_ativos = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM Paciente WHERE tipo = 'responsavel'")
        total_responsaveis = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM Paciente WHERE tipo = 'filho'")
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