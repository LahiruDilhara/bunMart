'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface PaymentFormProps {
    clientSecret: string;
    amount: number;
    currency: string;
    paymentId: string;
    orderId: string;
}

// stripe card form - gets clientSecret from the payment page
// clientSecret comes from our backend when order service creates the payment
export default function PaymentForm({
    clientSecret, amount, currency, paymentId, orderId
}: PaymentFormProps) {

    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePay = async () => {
        if (!stripe || !elements) return;

        setLoading(true);
        setError('');

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) return;

        // send card directly to stripe - never goes through our server
        const { error, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: { card: cardElement } }
        );

        if (error) {
            setError(error.message || 'Payment failed');
            setLoading(false);
            window.location.href = `/payment/failed?orderId=${orderId}`;
        } else if (paymentIntent?.status === 'succeeded') {
            setLoading(false);
            window.location.href = `/payment/success?paymentId=${paymentId}`;
        }
    };

    const cardStyle = {
        style: {
            base: {
                fontSize: '16px',
                color: '#1a1a1a',
                '::placeholder': { color: '#aab7c4' },
            },
            invalid: { color: '#dc3545' },
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>💳 Payment Details</h2>
                <p style={styles.subtitle}>Secure 256-bit SSL Encrypted Payment</p>
            </div>

            <div style={styles.cardSection}>
                <label style={styles.label}>Credit or Debit Card</label>

                {/* stripe injects card fields here - test with 4242 4242 4242 4242 */}
                <div style={styles.stripeBox}>
                    <CardElement options={cardStyle} />
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}
            </div>

            <div style={styles.buttons}>
                <button
                    style={styles.backButton}
                    onClick={() => window.history.back()}
                >
                    ← Back to Shipping
                </button>

                <button
                    style={loading ? styles.payButtonDisabled : styles.payButton}
                    onClick={handlePay}
                    disabled={loading || !stripe}
                >
                    {loading ? 'Processing...' : `Pay ${currency} ${amount} Now`}
                </button>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '600px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
    },
    header: { marginBottom: '20px' },
    title: { margin: '0 0 5px 0', fontSize: '24px', color: '#1a1a1a' },
    subtitle: { margin: '0', color: '#888', fontSize: '14px' },
    cardSection: { marginBottom: '20px' },
    label: { display: 'block', fontWeight: '500', marginBottom: '8px', color: '#333' },
    stripeBox: {
        padding: '15px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#fafafa',
    },
    errorBox: {
        backgroundColor: '#fff5f5',
        border: '1px solid #dc3545',
        borderRadius: '6px',
        padding: '10px',
        color: '#dc3545',
        fontSize: '14px',
        marginTop: '8px',
    },
    buttons: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '30px',
    },
    backButton: {
        background: 'none',
        border: 'none',
        color: '#555',
        fontWeight: '600',
        cursor: 'pointer',
        padding: '10px',
        fontSize: '14px',
    },
    payButton: {
        backgroundColor: '#f39c12',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '15px 30px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    payButtonDisabled: {
        backgroundColor: '#ccc',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '15px 30px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'not-allowed',
    },
};