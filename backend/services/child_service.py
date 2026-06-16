import bcrypt
from psycopg2 import errors as pg_errors
from psycopg2.extras import RealDictCursor
from fastapi import HTTPException
from services.connection_db import get_db_connection
from services.models import Child

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

def delete_child_service(id_filho: int, id_responsavel: int):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            DELETE FROM Paciente
            WHERE idPaciente = %s AND idResponsavel = %s AND tipo = 'filho'
        """, (id_filho, id_responsavel))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Filho não encontrado ou sem permissão.")
        conn.commit()
        return {"success": True, "message": "Dependente removido com sucesso."}
    except HTTPException:
        raise
    except Exception as err:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def update_child_username_service(id_filho: int, id_responsavel: int, novo_username: str):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE Paciente
            SET nome = %s, username = %s
            WHERE idPaciente = %s AND idResponsavel = %s AND tipo = 'filho'
        """, (novo_username, novo_username, id_filho, id_responsavel))

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Filho não encontrado ou sem permissão.")

        conn.commit()
        return {"success": True, "message": "Nome atualizado com sucesso."}
    except pg_errors.UniqueViolation:
        if conn: conn.rollback()
        raise HTTPException(status_code=409, detail="Este username já está em uso.")
    except HTTPException:
        raise
    except Exception as err:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()