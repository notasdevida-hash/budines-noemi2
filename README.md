
# Budines Noemi - E-commerce

Este proyecto cuenta con una integración completa de pagos con Mercado Pago, gestión de inventario en Firestore y recibos inteligentes generados por IA.

## Configuración de Variables de Entorno (Vercel)

Para que el sistema funcione al 100%, debes tener estas **7 variables** configuradas en tu panel de Vercel:

1.  **`MP_ACCESS_TOKEN`**: Tu Access Token de Mercado Pago (Panel de Desarrollador).
2.  **`FIREBASE_SERVICE_ACCOUNT`**: El JSON completo de tu llave privada de Firebase (descargado desde Project Settings > Service Accounts).
3.  **`NEXT_PUBLIC_SITE_URL`**: La URL de tu sitio (ej: `https://tu-web.vercel.app`) **SIN** barra final `/`.
4.  **`RESEND_API_KEY`**: Tu API Key de [Resend.com](https://resend.com) para enviar los emails.
5.  **`GOOGLE_GENAI_API_KEY`**: Tu API Key de [Google AI Studio](https://aistudio.google.com/) para que la IA genere los recibos.
6.  **`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`**: Tu Cloud Name de Cloudinary.
7.  **`NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`**: Tu Upload Preset (Unsigned) de Cloudinary.

## Estructura del Backend
- `/api/checkout`: Crea la orden y la preferencia de Mercado Pago.
- `/api/webhook/mercadopago`: Procesa pagos, descuenta stock y envía recibos por email mediante GenAI.

## Notas Importantes
- **Recibos**: Si usas la cuenta gratuita de Resend sin dominio verificado, el sistema intentará enviar desde `onboarding@resend.dev`. Solo recibirás los correos en la dirección con la que te registraste en Resend hasta que verifiques un dominio propio.
- **Pruebas de Pago**: Para probar Mercado Pago, usa siempre una ventana de **incógnito** y asegúrate de **no estar logueado** con la misma cuenta de Mercado Pago que usaste para crear el Token, de lo contrario el pago fallará (no puedes comprarte a ti mismo).
