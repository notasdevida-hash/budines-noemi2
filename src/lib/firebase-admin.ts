
import * as admin from 'firebase-admin';

/**
 * PARTE 4: FIREBASE ADMIN (El "Jefe" del Servidor)
 * Este archivo permite que nuestra API hable con la base de datos de forma segura.
 * Solo funciona en el lado del servidor (API Routes).
 */

if (!admin.apps.length) {
  try {
    // Intentamos leer la "llave maestra" (Service Account) desde las variables de entorno
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT || '{}'
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin conectado correctamente');
  } catch (error) {
    console.error('❌ Error al conectar Firebase Admin:', error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
