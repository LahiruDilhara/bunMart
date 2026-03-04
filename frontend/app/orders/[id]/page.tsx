import { OrderView } from "@/order/OrderView";

export const metadata = {
    title: "Order Details - BunMart",
    description: "View your order details at BunMart",
};

export default async function OrderPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    return <OrderView orderId={resolvedParams.id} />;
}
