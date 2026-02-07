# Budines Noemi - E-commerce

Este proyecto cuenta con una integración completa de pagos con Mercado Pago y gestión de inventario en Firestore.

## Configuración de Variables de Entorno (Vercel)

Para que el sistema de pagos funcione, debes agregar estas variables en tu panel de Vercel:

1. **`MP_ACCESS_TOKEN`**: Tu Access Token de Mercado Pago (lo sacas de tu Panel de Desarrollador de MP).
2. **`FIREBASE_SERVICE_ACCOUNT`**: 
   - Ve a Firebase Console > Project Settings > Service Accounts.
   - Click en "Generate new private key".
   - Abre el JSON descargado, copia todo su contenido y pégalo aquí.
3. **`NEXT_PUBLIC_SITE_URL`**: La URL de tu sitio (ej: `https://tu-web.vercel.app`).

## Estructura del Backend Serverless
- `/api/crear-pago`: Crea la orden en Firestore y genera el link de Mercado Pago.
- `/api/webhook-mercadopago`: Recibe las notificaciones de pago y actualiza el estado automáticamente.

## Gestión de Admin
Para entrar al panel `/admin`, recuerda crear un usuario en Auth y agregarlo a la colección `roles_admin` en Firestore.
