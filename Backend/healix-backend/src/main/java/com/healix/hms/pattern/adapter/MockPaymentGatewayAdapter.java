package com.healix.hms.pattern.adapter;

import com.healix.hms.model.enums.PaymentType;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * =====================================================================
 * MockPaymentGatewayAdapter - Concrete Adapter for Development & Testing
 * =====================================================================
 * Demonstrates the full payment lifecycle (authorization, capture,
 * receipt generation) without real financial transactions.
 * =====================================================================
 */
@Component("mockPaymentGatewayAdapter")
@ConditionalOnProperty(name = "app.payment.mode", havingValue = "mock", matchIfMissing = true)
public class MockPaymentGatewayAdapter implements PaymentGatewayAdapter {

    @Override
    public String getGatewayName() {
        return "MediCare Mock Payment Gateway (Zero-Cost Sandbox)";
    }

    @Override
    public PaymentResult processPayment(String paymentReference, BigDecimal amount,
                                        PaymentType paymentType, String paymentMethod) {
        // Generate simulated bank transaction ID
        String txnId = "TXN-TRV-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return new PaymentResult(true, txnId, "Payment of INR " + amount + " processed successfully via " + paymentMethod);
    }
}
