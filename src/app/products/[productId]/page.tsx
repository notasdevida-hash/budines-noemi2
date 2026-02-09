
"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * @fileoverview Redirección de seguridad.
 * Esta ruta dinámica [productId] causaba conflicto con [slug].
 * Ahora redirige cualquier hit a la ruta maestra unificada.
 */

export default function ProductIdRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params.productId) {
      router.replace(`/products/${params.productId}`);
    }
  }, [params, router]);

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
