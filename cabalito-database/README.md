# Cabalito database

Este directorio contiene los scripts de inicialización para PostgreSQL usados por Docker Compose.

## Qué incluye

- Creación de la base de datos inicial
- Carga de datos base si aplica

## Uso

Los scripts se ejecutan automáticamente al levantar el contenedor PostgreSQL por primera vez.

```bash
docker compose up cabalito-postgres
```
