
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
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

  const chartData = useMemo(() => {
    if (!orders) return [];

    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    const daysInWeek = eachDayOfInterval({ start, end });

    return daysInWeek.map((day) => {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Ventas Totales", val: `$${totalSales}`, sub: "Órdenes aprobadas", icon: DollarSign, color: "text-green-500", bg: "bg-green-50" },
          { title: "Pedidos Pagados", val: paidOrdersCount, sub: "Listos para entrega", icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-50" },
          { title: "Stock Bajo", val: lowStockCount, sub: "Menos de 5 unidades", icon: Package, color: "text-amber-500", bg: "bg-amber-50" },
          { title: "Total Productos", val: products?.length || 0, sub: "En catálogo activo", icon: TrendingUp, color: "text-primary", bg: "bg-primary/5" }
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-xl rounded-[2rem] overflow-hidden group">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.title}</p>
                <div className="text-3xl font-black tracking-tighter text-foreground">{stat.val}</div>
                <p className="text-xs font-bold text-muted-foreground/60">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-2xl border-none rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-2xl font-black uppercase tracking-tight text-primary">Ventas de la Semana</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-8 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis 
                dataKey="name" 
                fontSize={10} 
                fontWeight="900"
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                fontSize={10} 
                fontWeight="900"
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `$${value}`} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px' }}
                itemStyle={{ fontWeight: '900', color: 'hsl(var(--primary))' }}
                labelStyle={{ fontWeight: '900', marginBottom: '5px', textTransform: 'uppercase', fontSize: '10px' }}
                formatter={(value: number) => [`$${value}`, 'VENTAS']}
              />
              <Bar 
                dataKey="total" 
                fill="hsl(var(--primary))" 
                radius={[10, 10, 10, 10]} 
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
