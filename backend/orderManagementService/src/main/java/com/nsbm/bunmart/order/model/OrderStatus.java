package com.nsbm.bunmart.order.model;

/**
 * Order lifecycle states.
 */
public enum OrderStatus {
    PENDING,
    AWAIT_PAYMENT,
    PAID,
    CONFIRMED,
    IN_PROGRESS,
    PREPARED,
    SHIPPED,
    DELIVERED,
    CANCELLED;

    public String getValue() {
        return name().toLowerCase();
    }

    public static boolean isValid(String status) {
        if (status == null || status.isBlank()) return false;
        String upper = status.trim().toUpperCase().replace('-', '_');
        for (OrderStatus s : values()) {
            if (s.name().equals(upper)) return true;
        }
        return false;
    }

    /** Statuses in which the user may update shipping address. */
    public static boolean canUpdateShippingAddress(String status) {
        return PENDING.getValue().equalsIgnoreCase(status)
                || AWAIT_PAYMENT.getValue().equalsIgnoreCase(status);
    }

    /** Statuses in which the user may cancel the order. */
    public static boolean canCancel(String status) {
        if (status == null) return false;
        String s = status.trim().toLowerCase().replace("-", "_");
        return PENDING.getValue().equals(s) || AWAIT_PAYMENT.getValue().equals(s)
                || PAID.getValue().equals(s) || CONFIRMED.getValue().equals(s);
    }
}
