from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from services.images_service import process_image_service
from services.auth_service import (
    register_user_service,
    login_user_service,
    request_password_reset_service,
    reset_password_service,
)
from services.child_service import (
    create_child_service,
    get_dependents_service,
    delete_child_service,
    update_child_username_service,
)
from services.character_service import (
    add_character_name_service,
    get_character_status,
    add_mission_service,
    get_missions_service,
)
from services.health_service import (
    save_status_to_db,
    get_historico_service,
)
from services.admin_service import (
    get_admin_stats_service,
    get_monthly_registrations_service,
    get_all_users_admin_service,
    get_all_users_grouped_service,
    toggle_user_status_service,
)
from services.achievement_service import get_conquistas_service
from status import Status
from services.decay_service import iniciar_decaimento

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

class LoginData(BaseModel):
    login: str
    senha: str

class StatusData(BaseModel):
    idPaciente: int
    carboidrato: float
    glicemia: float
    proteina: float
    classification: str = ""

class ToggleStatusData(BaseModel):
    isActive: bool

class MissionData(BaseModel):
    idPaciente: int
    Missao1: int
    Missao2: int
    Missao3: int
    Missao4: int

class ForgotPasswordData(BaseModel):
    email: str

class ResetPasswordData(BaseModel):
    email: str
    token: str
    nova_senha: str

pet_status = Status()
iniciar_decaimento()

@app.post("/process-image")
async def process_image(data: ImageData):
    try:
        classification, delta = process_image_service(data.image_base64, pet_status)
        return {"classification": classification, "status": delta}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.post("/register")
async def register_user(user: User):
    try:
        result = register_user_service(user)
        return result
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
    
@app.post("/login")
async def login_user(user: LoginData):
    try:
        result = login_user_service(user.login, user.senha)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.post("/save-status")
async def save_status(status_data: StatusData):
    try:
        novas_conquistas = save_status_to_db(status_data.idPaciente, {
            'carboidrato': status_data.carboidrato,
            'glicemia': status_data.glicemia,
            'proteina': status_data.proteina,
            'classification': status_data.classification
        })
        return {"message": "Status saved successfully", "novas_conquistas": novas_conquistas}
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
    
@app.get("/conquistas/{id_paciente}")
async def get_conquistas(id_paciente: int):
    try:
        result = get_conquistas_service(id_paciente)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/historico/{id_paciente}")
async def get_historico(id_paciente: int, periodo: str = Query(default="week", pattern="^(week|month)$"), data_ref: str = Query(default=None)):
    try:
        result = get_historico_service(id_paciente, periodo, data_ref)
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
    
@app.get("/admin-users")
async def get_admin_users():
    try:
        result = get_all_users_admin_service()
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.get("/admin-users-grouped")
async def get_admin_users_grouped():
    try:
        result = get_all_users_grouped_service()
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/admin-users/{user_id}/toggle")
async def toggle_user_status(user_id: int, data: ToggleStatusData):
    try:
        result = toggle_user_status_service(user_id, data.isActive)
        return result
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
    
class UpdateChildData(BaseModel):
    idResponsavel: int
    novoUsername: str

@app.delete("/child/{id_filho}")
async def delete_child(id_filho: int, id_responsavel: int = Query(...)):
    try:
        result = delete_child_service(id_filho, id_responsavel)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/child/{id_filho}/username")
async def update_child_username(id_filho: int, data: UpdateChildData):
    try:
        result = update_child_username_service(id_filho, data.idResponsavel, data.novoUsername)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))