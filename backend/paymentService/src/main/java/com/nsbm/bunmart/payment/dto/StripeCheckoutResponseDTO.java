package com.nsbm.bunmart.payment.dto;

/**
 * Stripe Checkout Session URL for redirecting the user to pay.
 */
public class StripeCheckoutResponseDTO {

    private String redirectUrl;

    public StripeCheckoutResponseDTO() {
    }

    public StripeCheckoutResponseDTO(String redirectUrl) {
        this.redirectUrl = redirectUrl;
    }

    public String getRedirectUrl() {
        return redirectUrl;
    }

    public void setRedirectUrl(String redirectUrl) {
        this.redirectUrl = redirectUrl;
    }
}
