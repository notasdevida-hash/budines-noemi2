
"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * @fileoverview Redirección de Slugs a IDs.
 * Para evitar conflictos de rutas gemelas en Next.js.
 */
export default function SlugRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params.slug) {
      router.replace(`/products/${params.slug}`);
    }
  }, [params, router]);

  return null;
}
