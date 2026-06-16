import psycopg2
from psycopg2 import OperationalError
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from fastapi import HTTPException
import os

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