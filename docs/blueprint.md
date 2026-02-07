# **App Name**: Noemi's Sweet Treats

## Core Features:

- Product Listing: Display a list of available 'Budines' fetched from Firestore, each with an image, name, and price.
- Shopping Cart: Allow users to add products to a cart, adjust quantities, and view the total cost.
- Checkout Process: Collect necessary customer information (name, phone, email) and create an order in Firestore with 'pending' status upon checkout initiation.
- Admin Authentication: Secure the admin panel using Firebase Authentication (email/password) to ensure only authorized users can access it.
- Product Management (Admin): Enable admin users to create, edit, and delete product listings with details such as name, price, image URL, description, and active status.
- Order Management (Admin): Display a list of orders from Firestore, each showing customer name, phone, email, purchased products, total amount, and order status.
- Mercado Pago Integration: Set up the flow for payment processing with Mercado Pago, including a webhook endpoint for handling payment notifications and updating order status in Firestore.

## Style Guidelines:

- Primary color: Soft beige (#F5F5DC) to evoke a sense of warmth and artisan quality.
- Background color: Off-white (#FAFAFA), almost desaturated beige to maintain a clean, minimalist aesthetic.
- Accent color: Muted brown (#A69079) for a touch of sophistication and to complement the other colors.
- Body and headline font: 'PT Sans' for a modern yet approachable feel.
- Use simple, line-based icons for a minimalist aesthetic.
- Employ a clean and spacious layout to emphasize the product images and descriptions. Ensure the design is responsive across devices.
- Use subtle transitions and animations to enhance user experience, such as loading animations and hover effects.