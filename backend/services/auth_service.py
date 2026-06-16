import bcrypt
import secrets
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from fastapi import HTTPException
from psycopg2 import errors as pg_errors
from services.connection_db import get_db_connection
from services.email_service import send_reset_email
from services.models import User

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