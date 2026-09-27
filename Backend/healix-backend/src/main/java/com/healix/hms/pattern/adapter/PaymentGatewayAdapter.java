package com.healix.hms.pattern.adapter;

import com.healix.hms.model.enums.PaymentStatus;
import com.healix.hms.model.enums.PaymentType;

import java.math.BigDecimal;

/**
 * =====================================================================
 * PaymentGatewayAdapter - ADAPTER PATTERN (Target Interface)
 * =====================================================================
 * Encapsulates online checkout processing (Razorpay, Stripe, UPI, Mock)
 * Never exposes raw card details.
 * =====================================================================
 */
public interface PaymentGatewayAdapter {

    PaymentResult processPayment(String paymentReference, BigDecimal amount,
                                 PaymentType paymentType, String paymentMethod);

    String getGatewayName();

    class PaymentResult {
        private final boolean success;
        private final String transactionId;
        private final String message;

        public PaymentResult(boolean success, String transactionId, String message) {
            this.success = success;
            this.transactionId = transactionId;
            this.message = message;
        }

        public boolean isSuccess() { return success; }
        public String getTransactionId() { return transactionId; }
        public String getMessage() { return message; }
    }
}
