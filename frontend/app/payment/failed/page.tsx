'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentFailedPage() {
    const searchParams = useSearchParams();
    // keep orderId so user can retry without losing their order
    const orderId = searchParams.get('orderId');

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.icon}>❌</div>
                <h1 style={styles.title}>Payment Failed</h1>
                <p style={styles.message}>
                    Your payment could not be processed. Please check your
                    card details and try again.
                </p>
                <Link href={`/payment?orderId=${orderId}`} style={styles.retryButton}>
                    Try Again
                </Link>
                <Link href="/" style={styles.homeLink}>
                    Back to Shop
                </Link>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    page: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '50px', textAlign: 'center', maxWidth: '500px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
    icon: { fontSize: '60px', marginBottom: '20px' },
    title: { color: '#dc3545', fontSize: '28px', marginBottom: '15px' },
    message: { color: '#555', lineHeight: '1.6', marginBottom: '30px' },
    retryButton: { backgroundColor: '#f39c12', color: 'white', padding: '14px 30px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', display: 'inline-block', marginBottom: '15px' },
    homeLink: { display: 'block', color: '#888', textDecoration: 'none', fontSize: '14px' },
};