# How product Add to cart works
1. User clicks on add to cart button
2. The request is sent to the product service
3. The product service checks if the product is in stock
4. If the product is in stock, then the product service send gRPC call to the cart service to add the product to the cart
5. The cart service adds the product to the cart

