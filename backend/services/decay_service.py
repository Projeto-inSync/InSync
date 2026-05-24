import threading
import time
from services.connection_db import get_db_connection

def decair_status_no_banco():
    while True:
        time.sleep(3 * 60)
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE Personagem
                SET
                    carboidrato = GREATEST(0, ROUND((carboidrato * 0.80)::numeric, 2)),
                    glicemia = GREATEST(0, ROUND((glicemia * 0.80)::numeric, 2)),
                    proteina = GREATEST(0, ROUND((proteina * 0.80)::numeric, 2))
            """)
            conn.commit()
            print("Decaimento aplicado no banco.")
        except Exception as e:
            print(f"Erro no dacaimento: {e}")
            if conn: conn.rollback()
        finally:
            if cursor: cursor.close()
            if conn: conn.close()

def iniciar_decaimento():
    t = threading.Thread(target=decair_status_no_banco, daemon=True)
    t.start()