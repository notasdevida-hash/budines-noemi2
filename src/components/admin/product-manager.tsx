
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Demo products
const DEMO_PRODUCTS = [
  { id: '1', name: 'Budín de Limón', price: 1500, active: true },
  { id: '2', name: 'Budín de Chocolate', price: 1800, active: true },
  { id: '3', name: 'Budín de Vainilla', price: 1400, active: false },
];

export function ProductManager() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Producto</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="prod-name">Nombre</Label>
                <Input id="prod-name" placeholder="Ej: Budín de Nuez" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-price">Precio</Label>
                <Input id="prod-price" type="number" placeholder="2000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-img">URL Imagen</Label>
                <Input id="prod-img" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-desc">Descripción</Label>
                <Textarea id="prod-desc" placeholder="Detalles del producto..." />
              </div>
              <Button type="submit" className="w-full mt-4">Guardar Producto</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventario de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_PRODUCTS.map((prod) => (
                <TableRow key={prod.id}>
                  <TableCell className="font-medium">{prod.name}</TableCell>
                  <TableCell>${prod.price}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${prod.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {prod.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
