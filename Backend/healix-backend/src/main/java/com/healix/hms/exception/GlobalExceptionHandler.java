package com.healix.hms.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * =====================================================================
 * GlobalExceptionHandler - demonstrates EXCEPTION HANDLING in OOP
 * =====================================================================
 * OOP Concepts:
 *   - Exception handling: try/catch/throw/throws/finally
 *   - Custom exceptions: mapped to user-friendly messages
 *   - Never exposes stack traces to end users
 *
 * Spring's @ControllerAdvice handles exceptions globally across all controllers.
 * =====================================================================
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle patient not found - returns error page with message.
     */
    @ExceptionHandler(PatientNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handlePatientNotFound(PatientNotFoundException ex, Model model) {
        model.addAttribute("errorTitle", "Patient Not Found");
        model.addAttribute("errorMessage", ex.getMessage());
        model.addAttribute("errorCode", "404");
        return "error/error";
    }

    @ExceptionHandler(DoctorNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleDoctorNotFound(DoctorNotFoundException ex, Model model) {
        model.addAttribute("errorTitle", "Doctor Not Found");
        model.addAttribute("errorMessage", ex.getMessage());
        model.addAttribute("errorCode", "404");
        return "error/error";
    }

    @ExceptionHandler(AppointmentNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleAppointmentNotFound(AppointmentNotFoundException ex, Model model) {
        model.addAttribute("errorTitle", "Appointment Not Found");
        model.addAttribute("errorMessage", ex.getMessage());
        model.addAttribute("errorCode", "404");
        return "error/error";
    }

    @ExceptionHandler(AppointmentConflictException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public String handleAppointmentConflict(AppointmentConflictException ex, Model model) {
        model.addAttribute("errorTitle", "Appointment Conflict");
        model.addAttribute("errorMessage", ex.getMessage());
        model.addAttribute("errorCode", "409");
        return "error/error";
    }

    @ExceptionHandler(MedicalRecordNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleMedicalRecordNotFound(MedicalRecordNotFoundException ex, Model model) {
        model.addAttribute("errorTitle", "Medical Record Not Found");
        model.addAttribute("errorMessage", ex.getMessage());
        model.addAttribute("errorCode", "404");
        return "error/error";
    }

    @ExceptionHandler(DepartmentNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleDepartmentNotFound(DepartmentNotFoundException ex, Model model) {
        model.addAttribute("errorTitle", "Department Not Found");
        model.addAttribute("errorMessage", ex.getMessage());
        model.addAttribute("errorCode", "404");
        return "error/error";
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public String handleAccessDenied(Model model) {
        model.addAttribute("errorTitle", "Access Denied");
        model.addAttribute("errorMessage", "You do not have permission to access this page.");
        model.addAttribute("errorCode", "403");
        return "error/access-denied";
    }

    /**
     * Catch-all handler for unhandled exceptions.
     * Never exposes internal details to users.
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public String handleGenericException(Exception ex, Model model, HttpServletRequest request) {
        // Log the real error (not shown to user)
        System.err.println("Unhandled error at " + request.getRequestURI() + ": " + ex.getMessage());
        model.addAttribute("errorTitle", "Something Went Wrong");
        model.addAttribute("errorMessage", "An unexpected error occurred. Please try again later.");
        model.addAttribute("errorCode", "500");
        return "error/error";
    }
}
