from psycopg2.extras import RealDictCursor
from fastapi import HTTPException
from services.connection_db import get_db_connection
from services.constants import CATEGORIAS_SAUDAVEIS, LIMITE_GLICEMIA_ALERTA
from services.email_service import send_glycemia_alert_email
from services.achievement_service import verificar_e_desbloquear_conquistas

def verificar_e_alertar_responsavel(id_paciente: int, glicemia_atual: float, cursor):
    """
    Verifica se o paciente é filho, se a glicemia passou do limite,
    e se sim, busca o responsável e envia e-mail de alerta.
    Falhas no envio do e-mail são logadas mas não interrompem o fluxo principal.
    """
    if glicemia_atual <= LIMITE_GLICEMIA_ALERTA:
        return

    cursor.execute("""
        SELECT
            filho.nome  AS filho_nome,
            filho.tipo  AS filho_tipo,
            resp.email  AS resp_email,
            resp.nome   AS resp_nome
        FROM Paciente filho
        LEFT JOIN Paciente resp ON resp.idPaciente = filho.idResponsavel
        WHERE filho.idPaciente = %s
    """, (id_paciente,))

    row = cursor.fetchone()

    if not row or row['filho_tipo'] != 'filho' or not row['resp_email']:
        return

    try:
        send_glycemia_alert_email(
            responsavel_email=row['resp_email'],
            responsavel_nome=row['resp_nome'],
            filho_nome=row['filho_nome'],
            glicemia=glicemia_atual,
        )
    except Exception as e:
        print(f"AVISO: falha ao enviar e-mail de alerta de glicemia: {e}")

def save_status_to_db(id_paciente, status_data):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        classification = status_data.get('classification', '')
        classification_lower = classification.lower().strip()
        eh_saudavel = (
            classification.lower in CATEGORIAS_SAUDAVEIS or any(word in CATEGORIAS_SAUDAVEIS for word in classification_lower.split())
        )

        cursor.execute("""
            UPDATE Personagem
            SET carboidrato = LEAST(carboidrato + %s, 100),
                glicemia = LEAST(glicemia + %s, 100),
                proteina = LEAST(proteina + %s, 100),
                total_refeicoes = total_refeicoes + 1,
                total_refeicoes_saudaveis = total_refeicoes_saudaveis + %s
            WHERE idPaciente = %s
            RETURNING glicemia, total_refeicoes, total_refeicoes_saudaveis
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

        glicemia_pos_update = float(row['glicemia']) if row else 0.0
        verificar_e_alertar_responsavel(id_paciente, glicemia_pos_update, cursor)

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
        print(f"ERRO save_status_to_db: {str(err)}")
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()

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
                    AND registrado_em <= {base_date_condition} + INTERVAL '1 day'
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
                "media_glicemia":      round(sum(glicemia) / len(glicemia)),
                "media_proteina":      round(sum(proteina) / len(proteina)),
                "total_refeicoes":    total,
                "refeicoes_saudaveis": saudaveis,
            }
        }
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn:   conn.close()