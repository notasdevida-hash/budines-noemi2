
"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * @fileoverview Redireccionador de compatibilidad.
 * Redirige de /products/ID a /products/ID (que ahora es manejado por [slug]).
 * Esto evita conflictos de rutas en Next.js.
 */

export default function ProductIdRedirect() {
  const { productId } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (productId) {
      router.replace(`/products/${productId}`);
    }
  }, [productId, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
