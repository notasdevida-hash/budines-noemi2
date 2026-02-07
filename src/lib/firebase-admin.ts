
import * as admin from 'firebase-admin';

/**
 * FIREBASE ADMIN (Configuración Segura)
 * Esta función inicializa el SDK de Admin solo cuando es necesario.
 * Evita errores durante el "build" de Vercel.
 */
export function getAdminServices() {
  if (!admin.apps.length) {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccountVar) {
      throw new Error('Falta la variable de entorno FIREBASE_SERVICE_ACCOUNT');
    }

    try {
      const serviceAccount = JSON.parse(serviceAccountVar);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin inicializado');
    } catch (error) {
      console.error('❌ Error al parsear FIREBASE_SERVICE_ACCOUNT:', error);
      throw error;
    }
  }

  return {
    adminDb: admin.firestore(),
    adminAuth: admin.auth(),
  };
}
