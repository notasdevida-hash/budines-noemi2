
'use client';

import { initializeFirebase } from '@/firebase';

// This file is kept for backward compatibility but redirected to the new initialized instances.
// It's recommended to use the hooks (useAuth, useFirestore) from '@/firebase' instead.
const { auth, firestore: db } = initializeFirebase();

export { auth, db };
