
# Budines Noemi - E-commerce

Este proyecto cuenta con una integración completa de pagos con Mercado Pago y gestión de inventario en Firestore.

## Configuración de Variables de Envorno (Vercel)

Para que el sistema funcione correctamente, debes agregar estas variables en tu panel de Vercel:

1. **`MP_ACCESS_TOKEN`**: Tu Access Token de Mercado Pago (Panel de Desarrollador).
2. **`FIREBASE_SERVICE_ACCOUNT`**: El JSON completo de tu llave privada de Firebase.
3. **`NEXT_PUBLIC_SITE_URL`**: La URL de tu sitio (ej: `https://tu-web.vercel.app`) SIN barra final.
4. **`RESEND_API_KEY`**: Tu API Key de Resend.com para enviar los recibos por email.
5. **`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`**: Tu Cloud Name de Cloudinary.
6. **`NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`**: Tu Upload Preset (Unsigned) de Cloudinary.

## Estructura del Backend
- `/api/checkout`: Crea la orden y la preferencia de Mercado Pago.
- `/api/webhook/mercadopago`: Procesa pagos, descuenta stock y envía recibos por email mediante GenAI.

## Notas de Envío de Emails
- Si usas la cuenta gratuita de Resend sin dominio verificado, solo podrás enviar correos desde `onboarding@resend.dev`.
- Para enviar a cualquier cliente, debes verificar tu dominio en el panel de Resend.
