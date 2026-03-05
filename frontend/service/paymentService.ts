const PAYMENT_API = process.env.NEXT_PUBLIC_PAYMENT_API_URL
    || 'http://localhost:8085/api/payments';

// get payment details for a specific order
// backend gives us the clientSecret we need for stripe
export async function getPaymentByOrderId(orderId: string) {
    const response = await fetch(`${PAYMENT_API}/order/${orderId}`);
    if (!response.ok) {
        throw new Error('Failed to get payment details');
    }
    return response.json();
}

// check if payment went through after stripe processes it
export async function getPaymentStatus(paymentId: string) {
    const response = await fetch(`${PAYMENT_API}/${paymentId}`);
    if (!response.ok) {
        throw new Error('Failed to get payment status');
    }
    return response.json();
}