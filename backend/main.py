from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from services.connection_db import (
    register_user_service,
    add_character_name_service,
    login_user_service,
    save_status_to_db,
    get_character_status,
    add_mission_service,
    get_missions_service,
    get_admin_stats_service,
    get_monthly_registrations_service,
    create_child_service,
    get_dependents_service,
    request_password_reset_service,
    reset_password_service,
)

app = FastAPI()

class ImageData(BaseModel):
    image_base64: str

class User(BaseModel):
    nome: str
    email: str
    senha: str

class Character(BaseModel):
    idPaciente: int
    nome: str

class ChildData(BaseModel):
    username: str
    senha: str
    idResponsavel: str

class ForgotPasswordData(BaseModel):
    email: str

class ResetPasswordData(BaseModel):
    email: str
    token: str
    nova_senha: str

@app.post("/register")
async def register_user(user: User):
    try:
        result = register_user_service(user)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/create-child")
async def create_child(child: ChildData):
    try:
        result = create_child_service(child)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/add-character-name")
async def add_character_name(character: Character):
    try:
        print(f"Recebido idPaciente: {character.idPaciente}, nome: {character.nome}")
        result = add_character_name_service(character)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class LoginData(BaseModel):
    login: str
    senha: str

@app.post("/login")
async def login_user(user: LoginData):
    try:
        result = login_user_service(user.login, user.senha)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class StatusData(BaseModel):
    idPaciente: int
    energia: float
    forca: float
    felicidade: float
    alimentacao: float
    xp: int

@app.post("/save-status")
async def save_status(status_data: StatusData):
    try:
        save_status_to_db(status_data.idPaciente, {
            'energia': status_data.energia,
            'forca': status_data.forca,
            'felicidade': status_data.felicidade,
            'alimentacao': status_data.alimentacao,
            'xp': status_data.xp
        })
        return {"message": "Status saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/character-status/{id_paciente}")
async def character_status(id_paciente: int):
    try:
        status = get_character_status(id_paciente)
        return status
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class MissionData(BaseModel):
    idPaciente: int
    Missao1: int
    Missao2: int
    Missao3: int
    Missao4: int

@app.post("/add-mission")
async def add_mission(mission_data: MissionData):
    try:
        result = add_mission_service(
            mission_data.idPaciente,
            mission_data.Missao1,
            mission_data.Missao2,
            mission_data.Missao3,
            mission_data.Missao4
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/get-missions/{id_paciente}")
async def get_missions(id_paciente: int):
    try:
        result = get_missions_service(id_paciente)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/admin-stats")
async def get_admin_stats():
    try:
        result = get_admin_stats_service()
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/admin-monthly-registrations")
async def get_monthly_registrations():
    try:
        result = get_monthly_registrations_service()
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/dependents/{id_responsavel}")
async def get_dependents(id_responsavel: str):
    try:
        result = get_dependents_service(id_responsavel)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/forgot-password")
async def forgot_password(data: ForgotPasswordData):
    try:
        result = request_password_reset_service(data.email)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/reset-password")
async def reset_password(data: ResetPasswordData):
    try:
        result = reset_password_service(data.email, data.token, data.nova_senha)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))