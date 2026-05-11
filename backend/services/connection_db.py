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
    nome: str
    username: str
    senha: str
    idResponsavel: str

#revisar aqui
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

# revisar esse ponto aqui
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
    
#importar essa nova função(create_child_service) no início do main
def create_child_service(child: Child):
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
            child.nome,
            child.username,
            hashed_password.decode('utf-8'),
            child.idResponsavel
        ))

        id_child = cursor.fetchone()[0]

        conn.commit()
        cursor.close()
        conn.close()

        return {
            "success": True,
            "message": "Filho criado com sucesso",
            "idPaciente": id_child
        }
    
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))
    
def add_character_name_service(character: Character):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            INSERT INTO Personagem (idPaciente, nome)
            VALUES (%s, %s)
        """

        cursor.execute(query, (character.idPaciente, character.nome))
        conn.commit()

        cursor.close()
        conn.close()

        return {
            "success": True,
            "message": "Nome do personagem adicionado com sucesso",
            "nome": character.nome,
            "idPaciente": character.idPaciente
        }
    
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))
    
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
                AND tipo = 'responsavel'
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
        raise HTTPException(
            status_code=400, detail=str(err))
    
    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()

def save_status_to_db(id_paciente, status_data):
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

        cursor.close()
        conn.close()

    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))


def get_character_status(id_paciente: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        query = """
            SELECT forca, energia, felicidade, alimentacao, xp
            FROM Personagem
            WHERE idPaciente = %s
        """

        cursor.execute(query, (id_paciente,))
        status = cursor.fetchone()

        cursor.close()
        conn.close()

        if not status:
            raise HTTPException(status_code=404, detail="Status do personagem não encontrado")

        return status

    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))


def add_mission_service(id_paciente: int, missao1: int, missao2: int, missao3: int, missao4: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            INSERT INTO Missoes (idPaciente, missao1, missao2, missao3, missao4)
            VALUES (%s, %s, %s, %s, %s)
        """

        cursor.execute(query, (id_paciente, missao1, missao2, missao3, missao4))
        conn.commit()

        cursor.close()
        conn.close()

        return {
            "success": True,
            "message": "Missões adicionadas com sucesso",
            "idPaciente": id_paciente
        }

    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))


def get_missions_service(id_paciente: int):
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

        cursor.close()
        conn.close()

        if result:
            return result
        else:
            raise HTTPException(status_code=404, detail="Missões não encontradas")

    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))