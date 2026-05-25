# AGROTECH — Despliegue en Render (paso a paso)

## Qué necesitas
- Cuenta en GitHub: https://github.com (gratis)
- Cuenta en Render: https://render.com (gratis)
- Los dos archivos de este ZIP subidos a GitHub

---

## PASO 1 — Subir el código a GitHub

1. Entra a https://github.com → New repository
2. Nombre: `agrotech` → Create repository
3. Sube la carpeta `backend/` a ese repositorio
4. Sube la carpeta `frontend/` a ese mismo repositorio

---

## PASO 2 — Crear la base de datos en Render

1. Entra a https://render.com → New → PostgreSQL
2. Nombre: `agrotech-db`
3. Plan: **Free**
4. Clic en **Create Database**
5. Espera 1 minuto → copia el valor **Internal Database URL** (lo necesitas en el paso 3)

---

## PASO 3 — Desplegar el backend (API)

1. En Render → New → **Web Service**
2. Conecta tu repositorio de GitHub → selecciona `agrotech`
3. Configura así:
   - **Name:** `agrotech-api`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. En **Environment Variables** agrega:
   - Key: `DATABASE_URL` → Value: (pega la URL que copiaste en el paso 2)
   - Key: `NODE_ENV` → Value: `production`
5. Clic en **Create Web Service**
6. Espera 2 minutos → copia la URL que aparece arriba (ej: `https://agrotech-api.onrender.com`)

---

## PASO 4 — Desplegar el frontend

1. En Render → New → **Static Site**
2. Conecta el mismo repositorio → selecciona `agrotech`
3. Configura así:
   - **Name:** `agrotech-app`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. En **Environment Variables** agrega:
   - Key: `VITE_API_URL` → Value: (pega la URL del paso 3, ej: `https://agrotech-api.onrender.com`)
5. Clic en **Create Static Site**
6. Espera 3 minutos → listo ✅

---

## Resultado

Tu amigo entra a la URL del frontend (ej: `https://agrotech-app.onrender.com`),
registra cosechas, recarga la página y los datos siguen ahí guardados en la nube.

**No necesita instalar nada. Solo el link.**

---

## Si algo falla

- Verifica que `VITE_API_URL` no tenga `/` al final
- El plan free de Render "duerme" el backend tras 15 min sin uso → la primera petición tarda ~30 seg
- Para evitar eso: upgrade a Starter ($7/mes) o usa un cron job para mantenerlo activo
