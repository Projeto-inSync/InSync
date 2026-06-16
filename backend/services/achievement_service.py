from psycopg2.extras import RealDictCursor
from fastapi import HTTPException
from services.connection_db import get_db_connection


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

        if necessarias == 0:
            desbloqueou = total_refeicoes >= 1
        else:
            desbloqueou = total_saudaveis >= necessarias

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
        if cursor: cursor.close()
        if conn: conn.close()