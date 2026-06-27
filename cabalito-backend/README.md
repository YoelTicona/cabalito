# Cabalito backend

API FastAPI que expone los servicios de autenticación, productos, eventos, regiones, historial de precios y chat del asistente Casera IA.

## Requisitos

- Python 3.11+
- pip

## Instalación

```bash
cd cabalito-backend
pip install -r requirements.txt
```

## Ejecución local

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Docker

```bash
docker compose up --build cabalito-backend
```

La API se conecta a PostgreSQL mediante las variables de entorno configuradas en el compose.
