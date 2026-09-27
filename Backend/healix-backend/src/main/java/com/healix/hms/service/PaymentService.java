package com.healix.hms.service;

import com.healix.hms.model.Hospital;
import com.healix.hms.model.Patient;
import com.healix.hms.model.Payment;
import com.healix.hms.model.enums.PaymentType;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentService {
    Payment initiatePayment(Patient patient, Hospital hospital, Long appointmentId,
                            BigDecimal amount, PaymentType paymentType, String paymentMethod);
    Payment completePayment(String paymentReference);
    Payment getPaymentByReference(String paymentReference);
    Payment getPaymentByAppointmentId(Long appointmentId);
    List<Payment> getPaymentsByHospital(Long hospitalId);
    List<Payment> getPaymentsByPatient(Long patientId);
    BigDecimal calculateTodayRevenue(Long hospitalId);
    BigDecimal calculateRegistrationRevenue(Long hospitalId);
    BigDecimal calculateTotalRevenue(Long hospitalId);
}
