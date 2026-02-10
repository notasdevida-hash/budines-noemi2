
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameDay, 
  parseISO 
} from 'date-fns';
import { es } from 'date-fns/locale';

export function StatsOverview() {
  const db = useFirestore();
  
  const ordersQuery = useMemoFirebase(() => collection(db, 'orders'), [db]);
  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  
  const { data: orders } = useCollection(ordersQuery);
  const { data: products } = useCollection(productsQuery);

  const totalSales = useMemo(() => {
    return orders?.filter(o => o.status === 'paid').reduce((acc, o) => acc + o.total, 0) || 0;
  }, [orders]);

  const paidOrdersCount = useMemo(() => {
    return orders?.filter(o => o.status === 'paid').length || 0;
  }, [orders]);

  const lowStockCount = useMemo(() => {
    return products?.filter(p => p.stock !== undefined && p.stock < 5).length || 0;
  }, [products]);

  // Cálculo de datos reales para el gráfico semanal
  const chartData = useMemo(() => {
    if (!orders) return [];

    // Definir el inicio y fin de la semana actual (empezando el Lunes)
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    
    // Crear un intervalo de días para la semana
    const daysInWeek = eachDayOfInterval({ start, end });

    return daysInWeek.map((day) => {
      // Sumar el total de ventas aprobadas para este día específico
      const dayTotal = orders
        .filter((o) => o.status === 'paid' && o.createdAt)
        .filter((o) => {
          try {
            return isSameDay(parseISO(o.createdAt), day);
          } catch (e) {
            return false;
          }
        })
        .reduce((sum, o) => sum + o.total, 0);

      return {
        name: format(day, 'eee', { locale: es }).replace('.', '').toUpperCase(),
        total: dayTotal,
      };
    });
  }, [orders]);

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
          <CardTitle>Ventas Semanales (Semana Actual)</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `$${value}`} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => [`$${value}`, 'Ventas']}
              />
              <Bar 
                dataKey="total" 
                fill="hsl(var(--primary))" 
                radius={[6, 6, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
