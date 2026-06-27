import os
from fastapi import APIRouter, HTTPException
from app.schemas import LoginRequest, LoginResponse

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

STATIC_TOKEN = os.getenv("STATIC_TOKEN", "token-secreto-hackathon-2026")


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest):
    if body.username == "admin" and body.password == "admin123":
        return LoginResponse(token=STATIC_TOKEN, message="Bienvenido, admin.")
    raise HTTPException(status_code=401, detail="Credenciales incorrectas")
