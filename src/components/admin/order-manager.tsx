
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export function OrderManager() {
  const db = useFirestore();
  const ordersQuery = useMemoFirebase(() => {
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: orders, isLoading } = useCollection(ordersQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    {order.createdAt ? format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
                  </TableCell>
                  <TableCell className="font-medium">{order.customerName}</TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <p>{order.customerPhone}</p>
                      <p className="text-muted-foreground">{order.customerEmail || '-'}</p>
                    </div>
                  </TableCell>
                  <TableCell>${order.total}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        order.status === 'paid' ? 'default' : 
                        order.status === 'pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {order.status === 'paid' ? 'Pagado' : 
                       order.status === 'pending' ? 'Pendiente' : 'Fallido'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {!orders?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Aún no hay pedidos realizados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
