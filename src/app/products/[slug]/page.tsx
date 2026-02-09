
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * @fileoverview ARCHIVO DESACTIVADO
 * Se mantiene vacío para evitar conflictos con la ruta principal [productId].
 * Redirecciona al inicio si alguien intenta acceder por una URL de slug antigua.
 */
export default function SlugCleanup() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
