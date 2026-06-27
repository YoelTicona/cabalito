# Cabalito

Cabalito es una plataforma para monitorear precios, eventos y condiciones del mercado en La Paz a través de un radar público y un panel administrativo.

## Estructura del repositorio

- [cabalito-backend](cabalito-backend) — API FastAPI con autenticación, gestión de productos, eventos y chat.
- [cabalito-database](cabalito-database) — scripts de inicialización de PostgreSQL.
- [cabalito-frontend](cabalito-frontend) — frontend unificado con la experiencia pública y el panel de administración.

## Requisitos

- Docker Desktop
- Docker Compose v2
- Node.js 20+ (solo si quieres correr el frontend fuera de Docker)

## Desarrollo con Docker Compose

```bash
docker compose up --build
```

Servicios disponibles:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Base de datos PostgreSQL: localhost:5432

El frontend usa el Dockerfile de desarrollo, por lo que los cambios locales se reflejan rápidamente sin necesidad de reconstruir la imagen completa.

## Producción

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

## Logo

El logo principal usado en la documentación y la interfaz se encuentra en [cabalito-frontend/public/images](cabalito-frontend/public/images).
