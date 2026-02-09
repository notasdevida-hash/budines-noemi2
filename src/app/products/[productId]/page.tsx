
"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

/**
 * @fileoverview Redireccionador de seguridad.
 * Esta página ya no se usa para evitar conflictos con [slug].
 * Redirige cualquier tráfico residual a la ruta maestra.
 */

export default function ProductIdCleaner() {
  const router = useRouter();
  const params = useParams();
  const id = params.productId as string;

  useEffect(() => {
    if (id) {
      router.replace(`/products/${id}`);
    } else {
      router.replace('/');
    }
  }, [id, router]);

  return null;
}
