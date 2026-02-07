
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Demo data
const DEMO_ORDERS = [
  {
    id: 'ord_1',
    customer: 'Juan Perez',
    phone: '1122334455',
    email: 'juan@mail.com',
    total: 3500,
    status: 'paid',
    date: '2024-05-20',
  },
  {
    id: 'ord_2',
    customer: 'Maria Garcia',
    phone: '1199887766',
    email: '-',
    total: 1800,
    status: 'pending',
    date: '2024-05-21',
  },
  {
    id: 'ord_3',
    customer: 'Carlos Lopez',
    phone: '1155443322',
    email: 'carlos@mail.com',
    total: 2400,
    status: 'failed',
    date: '2024-05-21',
  }
];

export function OrderManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
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
            {DEMO_ORDERS.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.date}</TableCell>
                <TableCell className="font-medium">{order.customer}</TableCell>
                <TableCell>
                  <div className="text-xs">
                    <p>{order.phone}</p>
                    <p className="text-muted-foreground">{order.email}</p>
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
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
