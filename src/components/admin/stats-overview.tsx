
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ChartContainer } from 'recharts';

export function StatsOverview() {
  const db = useFirestore();
  
  const ordersQuery = useMemoFirebase(() => collection(db, 'orders'), [db]);
  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  
  const { data: orders } = useCollection(ordersQuery);
  const { data: products } = useCollection(productsQuery);

  const totalSales = orders?.filter(o => o.status === 'paid').reduce((acc, o) => acc + o.total, 0) || 0;
  const paidOrdersCount = orders?.filter(o => o.status === 'paid').length || 0;
  const lowStockCount = products?.filter(p => p.stock !== undefined && p.stock < 5).length || 0;

  // Datos ficticios para el gráfico (basados en órdenes reales si existen)
  const chartData = [
    { name: 'Lun', total: 4000 },
    { name: 'Mar', total: 3000 },
    { name: 'Mie', total: 2000 },
    { name: 'Jue', total: 2780 },
    { name: 'Vie', total: 1890 },
    { name: 'Sab', total: 2390 },
    { name: 'Dom', total: 3490 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalSales}</div>
            <p className="text-xs text-muted-foreground mt-1">Órdenes aprobadas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pagados</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{paidOrdersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Listos para entrega</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <Package className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Menos de 5 unidades</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{products?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">En catálogo activo</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Ventas Semanales</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`$${value}`, 'Ventas']}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
