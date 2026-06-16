from pydantic import BaseModel

class User(BaseModel):
    nome: str
    email: str
    senha: str

class Child(BaseModel):
    username: str
    senha: str
    idResponsavel: str

class Character(BaseModel):
    idPaciente: int
    nome: str