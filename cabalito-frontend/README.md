# Cabalito

Radar civico de precios para La Paz. App publica (mapa + chat con "La Casera IA") y panel de administracion.

## Como correrlo

```bash
npm install
cp .env.local.example .env.local
# edita .env.local si tu API no esta en http://localhost:8000
npm run dev
```

Abre `http://localhost:3000`.

- `/` landing
- `/radar` app publica, mobile-first, sin login
- `/login` acceso al panel
- `/admin` panel (Dashboard, Eventos, Regiones, Catalogo) — necesita login

## Decisiones y supuestos importantes

Por si tu backend se comporta distinto a lo que asumi leyendo el OpenAPI:

1. **Header de autorizacion**: el spec define el header como `authorization` (string libre), y `LoginResponse` no trae `token_type`. Asumi que se envia el token tal cual, sin prefijo `Bearer`. Si tu backend si espera `Bearer <token>`, cambia una linea en `lib/api.ts` (esta marcada con un comentario ahi mismo).

2. **Mapa**: en vez de instalar la libreria `mapcn` via su CLI (que requiere internet hacia su dominio en el momento de build), implemente el mismo enfoque a mano con `maplibre-gl` directo: mismas ventajas (gratis, sin API key, tiles de CARTO). Esta en `components/radar/radar-map.tsx`. Si despues quieres los componentes copy-paste de mapcn, corre `npx shadcn@latest add https://mapcn.dev/maps/map.json` y lo reemplazas sin tocar el resto del proyecto.

3. **El mapa del radar publico se mantiene siempre oscuro a proposito** (la identidad "Waze" del proyecto). La pastilla de tema solo vive en el sidebar del admin y cambia el panel; landing, login y radar mantienen su tema oscuro fijo como parte de la marca.

4. **Reportar incidente (`POST /events/report`)**: el schema pide `event_id` obligatorio, pero el endpoint publico del radar (`/products/radar`) no devuelve ningun `event_id` por producto — asi que un ciudadano normal no tiene forma de saber que ID poner. Deje el campo visible en el modal (en vez de ocultarlo o inventar un valor) para que el formulario funcione contra la API real, pero probablemente quieras que el backend devuelva el `event_id` activo dentro de `RadarProduct` para que esto sea 100% fluido sin pedirle un numero al usuario.

5. **"Forzar crisis (demo)"**: el endpoint pide un `event_id` y no hay una bandera global de "crea cualquier crisis". El boton usa el primer evento de la lista visible en la tabla como objetivo de la demo.

## Stack

Next.js (App Router) + TypeScript + Tailwind, sin libreria de componentes pesada — los componentes UI (`components/ui`) son propios y livianos a proposito para que el codigo sea facil de leer en el hackaton. `next-themes` para claro/oscuro, `maplibre-gl` para el mapa.
