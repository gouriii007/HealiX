package com.healix.hms.service.impl;

import com.healix.hms.exception.PaymentFailedException;
import com.healix.hms.model.Hospital;
import com.healix.hms.model.Patient;
import com.healix.hms.model.Payment;
import com.healix.hms.model.enums.PaymentStatus;
import com.healix.hms.model.enums.PaymentType;
import com.healix.hms.pattern.adapter.PaymentGatewayAdapter;
import com.healix.hms.repository.PaymentRepository;
import com.healix.hms.service.PaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentGatewayAdapter paymentGatewayAdapter;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                              PaymentGatewayAdapter paymentGatewayAdapter) {
        this.paymentRepository = paymentRepository;
        this.paymentGatewayAdapter = paymentGatewayAdapter;
    }

    @Override
    public Payment initiatePayment(Patient patient, Hospital hospital, Long appointmentId,
                                   BigDecimal amount, PaymentType paymentType, String paymentMethod) {
        Payment payment = new Payment();
        payment.setPaymentReference("PAY-REF-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        payment.setPatient(patient);
        payment.setHospital(hospital);
        payment.setAppointmentId(appointmentId);
        payment.setAmount(amount);
        payment.setPaymentType(paymentType);
        payment.setPaymentMethod(paymentMethod != null ? paymentMethod : "UPI");
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setCreatedAt(LocalDateTime.now());
        return paymentRepository.save(payment);
    }

    @Override
    public Payment completePayment(String paymentReference) {
        Payment payment = getPaymentByReference(paymentReference);
        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            return payment;
        }

        // Invoke modular gateway adapter
        PaymentGatewayAdapter.PaymentResult result = paymentGatewayAdapter.processPayment(
                payment.getPaymentReference(),
                payment.getAmount(),
                payment.getPaymentType(),
                payment.getPaymentMethod()
        );

        if (result.isSuccess()) {
            payment.setPaymentStatus(PaymentStatus.SUCCESS);
            payment.setTransactionId(result.getTransactionId());
            payment.setReceiptNumber("REC-TRV-" + System.currentTimeMillis());
            return paymentRepository.save(payment);
        } else {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new PaymentFailedException("Payment failed: " + result.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Payment getPaymentByReference(String paymentReference) {
        return paymentRepository.findByPaymentReference(paymentReference)
                .orElseThrow(() -> new PaymentFailedException("Payment not found for reference: " + paymentReference));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByHospital(Long hospitalId) {
        return paymentRepository.findByHospitalId(hospitalId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByPatient(Long patientId) {
        return paymentRepository.findByPatientId(patientId);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateTodayRevenue(Long hospitalId) {
        LocalDate today = LocalDate.now();
        return paymentRepository.findByHospitalId(hospitalId).stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().toLocalDate().isEqual(today))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    @Transactional(readOnly = true)
    public Payment getPaymentByAppointmentId(Long appointmentId) {
        return paymentRepository.findByAppointmentId(appointmentId).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateRegistrationRevenue(Long hospitalId) {
        return paymentRepository.findByHospitalIdAndPaymentType(hospitalId, PaymentType.REGISTRATION_FEE).stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateTotalRevenue(Long hospitalId) {
        return paymentRepository.findByHospitalId(hospitalId).stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
