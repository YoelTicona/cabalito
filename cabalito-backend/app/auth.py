import os
from fastapi import Header, HTTPException, status

STATIC_TOKEN = os.getenv("STATIC_TOKEN", "token-secreto-hackathon-2026")


def verify_token(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "").strip()
    if token != STATIC_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )
    return token
