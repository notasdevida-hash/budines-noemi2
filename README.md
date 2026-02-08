
# Budines Noemi - E-commerce

Este proyecto cuenta con una integración completa de pagos con Mercado Pago, gestión de inventario en Firestore y recibos inteligentes generados por IA.

## Configuración de Variables de Entorno (Vercel)

Para que el sistema funcione al 100%, debes tener estas **7 variables** configuradas en tu panel de Vercel:

1.  **`MP_ACCESS_TOKEN`**: Tu Access Token de Mercado Pago (Panel de Desarrollador).
2.  **`FIREBASE_SERVICE_ACCOUNT`**: El JSON completo de tu llave privada de Firebase.
3.  **`NEXT_PUBLIC_SITE_URL`**: La URL de tu sitio (ej: `https://tu-web.vercel.app`) **SIN** barra final `/`.
4.  **`RESEND_API_KEY`**: Tu API Key de [Resend.com](https://resend.com).
5.  **`GOOGLE_GENAI_API_KEY`**: Tu API Key de [Google AI Studio](https://aistudio.google.com/) para la IA.
6.  **`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`**: Tu Cloud Name de Cloudinary.
7.  **`NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`**: Tu Upload Preset (Unsigned) de Cloudinary.

## Notas Importantes sobre el Envío de Emails (Resend)
- **Error 403 / Testing Domain Restriction**: Si usas la dirección por defecto `onboarding@resend.dev`, Resend **solo enviará correos a la dirección con la que te registraste**.
- **Para enviar a clientes externos**: Debes ir a Resend > Domains, añadir tu dominio y verificarlo mediante registros DNS. Una vez verificado, podrás enviar recibos a cualquier dirección de email.

## Estructura del Backend
- `/api/checkout`: Crea la orden y la preferencia de Mercado Pago.
- `/api/webhook/mercadopago`: Procesa pagos, descuenta stock y envía recibos por email mediante GenAI.
