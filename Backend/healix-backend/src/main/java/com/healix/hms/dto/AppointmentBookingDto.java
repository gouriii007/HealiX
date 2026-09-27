package com.healix.hms.dto;

import jakarta.validation.constraints.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * AppointmentBookingDto - Data Transfer Object for booking an appointment.
 * Includes validation to prevent past date booking.
 */
public class AppointmentBookingDto {

    @NotNull(message = "Doctor is required")
    private Long doctorId;

    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(message = "Appointment date cannot be in the past")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate appointmentDate;

    @NotNull(message = "Appointment time is required")
    @DateTimeFormat(pattern = "HH:mm")
    private LocalTime appointmentTime;

    @NotBlank(message = "Reason for visit is required")
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;

    private String paymentMethod = "UPI_QR";

    private String paymentStatus = "PAID";

    private String transactionId;

    private java.math.BigDecimal feeAmount;

    // ---- Constructors ----
    public AppointmentBookingDto() {}

    // ---- Getters and Setters ----
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public LocalTime getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(LocalTime appointmentTime) { this.appointmentTime = appointmentTime; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public java.math.BigDecimal getFeeAmount() { return feeAmount; }
    public void setFeeAmount(java.math.BigDecimal feeAmount) { this.feeAmount = feeAmount; }
}
