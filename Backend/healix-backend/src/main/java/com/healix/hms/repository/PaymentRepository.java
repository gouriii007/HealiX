package com.healix.hms.repository;

import com.healix.hms.model.Hospital;
import com.healix.hms.model.Patient;
import com.healix.hms.model.Payment;
import com.healix.hms.model.enums.PaymentStatus;
import com.healix.hms.model.enums.PaymentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByPaymentReference(String paymentReference);
    List<Payment> findByPatient(Patient patient);
    List<Payment> findByHospital(Hospital hospital);
    List<Payment> findByHospitalId(Long hospitalId);
    List<Payment> findByPatientId(Long patientId);
    List<Payment> findByHospitalIdAndPaymentType(Long hospitalId, PaymentType paymentType);
    List<Payment> findByPaymentStatus(PaymentStatus status);
    Optional<Payment> findByAppointmentId(Long appointmentId);
}
