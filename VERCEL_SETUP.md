# Configuración de Variables de Entorno en Vercel

## Variables Requeridas

Para que la aplicación funcione correctamente en Vercel, debes configurar las siguientes variables de entorno:

### 1. NEXT_PUBLIC_API_URL

Esta variable define la URL base de tu API backend.

**Pasos para configurar en Vercel:**

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega una nueva variable:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** La URL de tu API backend (ejemplo: `https://api.tudominio.com/api`)
   - **Environment:** Selecciona los entornos donde aplica (Production, Preview, Development)
5. Haz clic en **Save**
6. **Redeploy** tu aplicación para que tome los cambios

## Configuración Local

Para desarrollo local, crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Copia el archivo de ejemplo
cp .env.example .env.local
```

Luego edita `.env.local` con tus valores:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Verificación

Después de configurar las variables:

1. Verifica que la variable esté configurada en Vercel
2. Realiza un nuevo deploy (o redeploy)
3. La aplicación debería funcionar sin el error de "URL de API no configurada"

## Notas Importantes

- Las variables que comienzan con `NEXT_PUBLIC_` son expuestas al navegador
- Después de cambiar variables de entorno en Vercel, siempre debes hacer un redeploy
- No commitees el archivo `.env.local` al repositorio (ya está en `.gitignore`)
