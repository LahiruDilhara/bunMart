'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const paymentId = searchParams.get('paymentId');

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.icon}>✅</div>
                <h1 style={styles.title}>Payment Successful!</h1>
                <p style={styles.message}>
                    Thank you for your order. Your payment has been confirmed
                    and your artisanal buns are on their way!
                </p>
                {/* show payment reference so user can track their order */}
                {paymentId && (
                    <p style={styles.reference}>
                        Payment Reference: <strong>{paymentId}</strong>
                    </p>
                )}
                <Link href="/" style={styles.button}>
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    page: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '50px', textAlign: 'center', maxWidth: '500px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
    icon: { fontSize: '60px', marginBottom: '20px' },
    title: { color: '#27ae60', fontSize: '28px', marginBottom: '15px' },
    message: { color: '#555', lineHeight: '1.6', marginBottom: '20px' },
    reference: { color: '#888', fontSize: '14px', marginBottom: '30px' },
    button: { backgroundColor: '#f39c12', color: 'white', padding: '14px 30px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', display: 'inline-block' },
};