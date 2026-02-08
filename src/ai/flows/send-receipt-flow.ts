
'use server';

/**
 * @fileOverview Flow para generar y enviar el cuerpo de un recibo de compra.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ReceiptInputSchema = z.object({
  customerName: z.string(),
  orderId: z.string(),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    price: z.number(),
  })),
  total: z.number(),
});

const ReceiptOutputSchema = z.object({
  subject: z.string().describe('Asunto del correo del recibo.'),
  body: z.string().describe('Cuerpo del correo en formato HTML amigable para el cliente.'),
});

export type ReceiptInput = z.infer<typeof ReceiptInputSchema>;
export type ReceiptOutput = z.infer<typeof ReceiptOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateReceiptPrompt',
  input: { schema: ReceiptInputSchema },
  output: { schema: ReceiptOutputSchema },
  prompt: `Eres el asistente de "Budines Noemi". Tu tarea es redactar un correo de agradecimiento y recibo para un cliente que acaba de pagar su pedido.

El tono debe ser cálido, artesanal y muy amable. 

Datos del pedido:
- Cliente: {{{customerName}}}
- ID de Orden: {{{orderId}}}
- Productos:
{{#each items}}
  * {{{name}}} (x{{{quantity}}}) - ${{{price}}} c/u
{{/each}}
- Total pagado: ${{{total}}}

Genera un asunto llamativo y un cuerpo de mensaje en HTML (usa estilos en línea básicos) que incluya una tabla de productos y un mensaje final invitándolos a disfrutar sus budines.`,
});

export async function generateReceiptContent(input: ReceiptInput): Promise<ReceiptOutput> {
  const { output } = await prompt(input);
  return output!;
}
