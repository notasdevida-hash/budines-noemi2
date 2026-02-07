
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Loader2, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

export function ProductManager() {
  const db = useFirestore();
  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: products, isLoading } = useCollection(productsQuery);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const colRef = collection(db, 'products');
    const newDocRef = doc(colRef);

    const newProduct = {
      id: newDocRef.id,
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      imageUrl: formData.get('imageUrl') as string,
      description: formData.get('description') as string,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setDocumentNonBlocking(newDocRef, newProduct, { merge: true });
    setIsDialogOpen(false);
  };

  const toggleProductStatus = (productId: string, currentStatus: boolean) => {
    const docRef = doc(db, 'products', productId);
    updateDocumentNonBlocking(docRef, { active: !currentStatus });
  };

  const updateStock = (productId: string, newStock: string) => {
    const stockNum = Number(newStock);
    if (isNaN(stockNum)) return;
    const docRef = doc(db, 'products', productId);
    updateDocumentNonBlocking(docRef, { stock: stockNum });
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('¿Estás segura de eliminar este producto?')) {
      const docRef = doc(db, 'products', productId);
      deleteDocumentNonBlocking(docRef);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Producto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="prod-name">Nombre</Label>
                <Input id="prod-name" name="name" placeholder="Ej: Budín de Nuez" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prod-price">Precio</Label>
                  <Input id="prod-price" name="price" type="number" placeholder="2000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prod-stock">Stock Inicial</Label>
                  <Input id="prod-stock" name="stock" type="number" placeholder="10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-img">URL Imagen</Label>
                <Input id="prod-img" name="imageUrl" placeholder="https://..." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-desc">Descripción</Label>
                <Textarea id="prod-desc" name="description" placeholder="Detalles del producto..." required />
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
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((prod) => (
                  <TableRow key={prod.id}>
                    <TableCell className="font-medium">{prod.name}</TableCell>
                    <TableCell>${prod.price}</TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        defaultValue={prod.stock} 
                        className="w-20 h-8" 
                        onBlur={(e) => updateStock(prod.id, e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => toggleProductStatus(prod.id, prod.active)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${prod.active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                      >
                        {prod.active ? 'Activo' : 'Inactivo'}
                      </button>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(prod.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!products?.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No hay productos registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
