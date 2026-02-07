
"use client";

import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ShoppingBag, LogOut, LayoutDashboard } from 'lucide-react';
import { OrderManager } from '@/components/admin/order-manager';
import { ProductManager } from '@/components/admin/product-manager';
import { StatsOverview } from '@/components/admin/stats-overview';

export default function AdminDashboard() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/admin');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) return <div className="p-24 text-center">Cargando panel...</div>;
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Panel de Gestión</h1>
          <p className="text-muted-foreground mt-2 font-medium">Bienvenida, {user.email}</p>
        </div>
        <Button variant="outline" onClick={() => signOut(auth)} className="shadow-sm">
          <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
        </Button>
      </div>

      <Tabs defaultValue="resumen" className="space-y-8">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="resumen" className="rounded-lg">
            <LayoutDashboard className="mr-2 h-4 w-4" /> Resumen
          </TabsTrigger>
          <TabsTrigger value="pedidos" className="rounded-lg">
            <ShoppingBag className="mr-2 h-4 w-4" /> Pedidos
          </TabsTrigger>
          <TabsTrigger value="productos" className="rounded-lg">
            <Package className="mr-2 h-4 w-4" /> Productos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="resumen">
          <StatsOverview />
        </TabsContent>
        
        <TabsContent value="pedidos">
          <OrderManager />
        </TabsContent>
        
        <TabsContent value="productos">
          <ProductManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
