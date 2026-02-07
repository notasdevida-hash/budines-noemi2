
import * as admin from 'firebase-admin';

/**
 * @fileoverview Inicialización de Firebase Admin SDK.
 * Evita inicializaciones múltiples en entornos serverless (Vercel).
 * Utiliza variables de entorno para las credenciales de la cuenta de servicio.
 */

if (!admin.apps.length) {
  try {
    // La variable FIREBASE_SERVICE_ACCOUNT debe ser un string JSON completo
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT || '{}'
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
