
"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ShoppingBag, LogOut } from 'lucide-react';
import { OrderManager } from '@/components/admin/order-manager';
import { ProductManager } from '@/components/admin/product-manager';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        router.push('/admin');
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (!user) return <div className="p-24 text-center">Cargando panel...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold">Panel de Gestión</h1>
          <p className="text-muted-foreground mt-2">Bienvenida, {user.email}</p>
        </div>
        <Button variant="outline" onClick={() => signOut(auth)}>
          <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
        </Button>
      </div>

      <Tabs defaultValue="pedidos" className="space-y-8">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pedidos">
            <ShoppingBag className="mr-2 h-4 w-4" /> Pedidos
          </TabsTrigger>
          <TabsTrigger value="productos">
            <Package className="mr-2 h-4 w-4" /> Productos
          </TabsTrigger>
        </TabsList>
        
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
