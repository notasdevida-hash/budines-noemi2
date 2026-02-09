
import { MetadataRoute } from 'next';
import { getAdminServices } from '@/lib/firebase-admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://budinesnoemi.com').replace(/\/$/, '');
  
  // Rutas estáticas
  const routes = ['', '/#productos', '/#nosotros', '/checkout'].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Rutas dinámicas de productos desde Firestore usando slugs
  try {
    const { adminDb } = getAdminServices();
    const productsSnap = await adminDb.collection('products').where('active', '==', true).get();
    
    const productRoutes = productsSnap.docs.map((doc) => {
      const data = doc.data();
      const identifier = data.slug || doc.id;
      return {
        url: `${siteUrl}/products/${identifier}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      };
    });

    return [...routes, ...productRoutes];
  } catch (error) {
    console.error('Error generando sitemap dinámico:', error);
    return routes;
  }
}
