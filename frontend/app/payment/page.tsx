'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useSearchParams } from 'next/navigation';
import PaymentForm from './components/PaymentForm';
import { getPaymentByOrderId } from '@/service/paymentService';

// publishable key is safe in frontend - only secret key stays in backend
const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

export default function PaymentPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const [payment, setPayment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!orderId) {
            setError('No order ID provided');
            setLoading(false);
            return;
        }

        // fetch payment details from backend using the orderId
        getPaymentByOrderId(orderId)
            .then(data => {
                setPayment(data);
                setLoading(false);
            })
            .catch(() => {
                setError('Could not load payment details');
                setLoading(false);
            });
    }, [orderId]);

    if (loading) return (
        <div style={styles.centered}>
            <p>Loading payment details...</p>
        </div>
    );

    if (error || !payment) return (
        <div style={styles.centered}>
            <p style={{ color: 'red' }}>{error || 'Payment not found'}</p>
        </div>
    );

    return (
        <div style={styles.page}>

            <div style={styles.progressSection}>
                <h1 style={styles.pageTitle}>Secure Checkout</h1>
                <p style={styles.pageSubtitle}>
                    Artisanal buns delivered to your doorstep
                </p>
                <div style={styles.progressBar}>
                    <div style={styles.progressFill} />
                </div>
                <p style={styles.stepText}>Step 2 of 3 (66%)</p>
            </div>

            <div style={styles.layout}>

                <div style={styles.leftColumn}>
                    {/* wrap PaymentForm with Elements so stripe context is available */}
                    <Elements
                        stripe={stripePromise}
                        options={{ clientSecret: payment.clientSecret }}
                    >
                        <PaymentForm
                            clientSecret={payment.clientSecret}
                            amount={payment.amount}
                            currency={payment.currency}
                            paymentId={payment.paymentId}
                            orderId={orderId!}
                        />
                    </Elements>
                </div>

                <div style={styles.rightColumn}>
                    <div style={styles.summaryBox}>
                        <h3 style={styles.summaryTitle}>Order Summary</h3>
                        <div style={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>{payment.currency} {payment.amount}</span>
                        </div>
                        <div style={styles.summaryRow}>
                            <span>Shipping</span>
                            <span style={{ color: '#27ae60' }}>FREE</span>
                        </div>
                        <div style={{ ...styles.summaryRow, ...styles.totalRow }}>
                            <span>Total</span>
                            <span style={{ color: '#f39c12', fontWeight: '700' }}>
                                {payment.currency} {payment.amount}
                            </span>
                        </div>
                        <div style={styles.secureNote}>
                            🔒 Secure 256-bit SSL Encrypted Payment
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    page: { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' },
    centered: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' },
    progressSection: { marginBottom: '30px' },
    pageTitle: { fontSize: '32px', fontWeight: '700', margin: '0 0 5px 0' },
    pageSubtitle: { color: '#888', margin: '0 0 15px 0' },
    progressBar: { backgroundColor: '#e0e0e0', borderRadius: '4px', height: '6px', width: '100%' },
    progressFill: { backgroundColor: '#f39c12', borderRadius: '4px', height: '6px', width: '66%' },
    stepText: { color: '#f39c12', fontWeight: '600', marginTop: '5px' },
    layout: { display: 'flex', gap: '30px', alignItems: 'flex-start' },
    leftColumn: { flex: '2' },
    rightColumn: { flex: '1' },
    summaryBox: { backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px' },
    summaryTitle: { fontSize: '18px', fontWeight: '600', marginBottom: '16px' },
    summaryRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' },
    totalRow: { fontWeight: '600', fontSize: '18px', borderBottom: 'none', marginTop: '8px' },
    secureNote: { textAlign: 'center', color: '#888', fontSize: '12px', marginTop: '16px' },
};