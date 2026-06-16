from psycopg2.extras import RealDictCursor
from fastapi import HTTPException
from services.connection_db import get_db_connection
from services.models import Character

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