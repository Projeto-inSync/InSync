from psycopg2.extras import RealDictCursor
from fastapi import HTTPException
from services.connection_db import get_db_connection

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

def get_all_users_grouped_service():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("""
            SELECT idPaciente AS id, nome, email AS contato, tipo, ativo AS is_active
            FROM Paciente
            WHERE tipo = 'responsavel'
            ORDER BY nome ASC
        """)
        responsaveis = cursor.fetchall()

        resultado = []
        for resp in responsaveis:
            cursor.execute("""
                SELECT idPaciente AS id, nome, username AS contato, tipo, ativo AS is_active
                FROM Paciente
                WHERE tipo = 'filho' AND idResponsavel = %s
                ORDER BY nome ASC
            """, (resp['id'],))
            filhos = cursor.fetchall()
            resultado.append({
                **resp,
                "filhos": list(filhos)
            })

        return resultado
    except Exception as err:
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
        cursor.execute("""
            UPDATE Paciente
            SET ativo = %s
            WHERE idPaciente = %s
        """, (is_active, user_id))
        cursor.execute("""
            SELECT tipo FROM Paciente WHERE idPaciente = %s
        """, (user_id,))
        row = cursor.fetchone()

        if row and row[0] == 'responsavel':
            cursor.execute("""
                UPDATE Paciente
                SET ativo = %s
                WHERE idResponsavel = %s AND tipo = 'filho'
            """, (is_active, user_id))
        conn.commit()
        return {"success": True, "message": f"Status do usuário alterado para {is_active}"}
    except Exception as err:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()