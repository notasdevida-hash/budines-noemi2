
"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * @fileoverview Redirección de Legado.
 * Esta página ya no se usa para evitar conflictos con [slug].
 * Redirige automáticamente a la nueva estructura de URL.
 */
export default function LegacyProductRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params.productId) {
      router.replace(`/products/${params.productId}`);
    }
  }, [params, router]);

  return null;
}
