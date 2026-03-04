export const mockOrderData = {
  id: "ORD-MOCK-user-171024", // using timestamp part as example
  status: "CONFIRMED",
  datePlaced: new Date().toISOString(), // Mocking current time based on backend
  items: [
    {
      productId: "P001",
      name: "Mock Product P001",
      quantity: 2,
      unitPrice: 4.99,
      lineTotal: 9.98,
      imageUrl: "/images/mock-product.png",
      description: "Mock product description",
      unit: "Pack" // Adding a dummy unit to match design
    }
  ],
  summary: {
    subtotal: 9.98,
    shipping: 2.99,
    tax: 0.00,
    total: 12.97,
  },
  shippingAddress: {
    name: "Jonathan Baker",
    addressLine1: "123 Sourdough Lane",
    addressLine2: "Breadview Heights, CA 90210",
    country: "United States",
    phoneNumber: "+1 (555) 0123-4567"
  },
  paymentMethod: {
    brand: "VISA",
    last4: "4242"
  }
};
