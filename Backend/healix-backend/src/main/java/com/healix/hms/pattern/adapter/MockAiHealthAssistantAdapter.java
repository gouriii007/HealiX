package com.healix.hms.pattern.adapter;

import com.healix.hms.dto.AiAssessmentRequestDto;
import com.healix.hms.dto.AiAssessmentResponseDto;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * =====================================================================
 * MockAiHealthAssistantAdapter - Concrete Adapter for AI Assistant
 * =====================================================================
 * Uses clinical heuristic rules to triage symptoms without requiring
 * external paid cloud API keys. Detects emergency triggers immediately.
 * =====================================================================
 */
@Component("mockAiHealthAssistantAdapter")
@ConditionalOnProperty(name = "app.ai.mode", havingValue = "mock", matchIfMissing = true)
public class MockAiHealthAssistantAdapter implements AiHealthAssistant {

    @Override
    public String getProviderName() {
        return "MediCare Rule-Based AI Engine (Offline Mock)";
    }

    @Override
    public AiAssessmentResponseDto assessSymptoms(AiAssessmentRequestDto request) {
        AiAssessmentResponseDto response = new AiAssessmentResponseDto();
        String symptoms = request.getSymptoms() != null ? request.getSymptoms().toLowerCase() : "";

        // 1. Check for Critical Emergency Symptoms
        if (symptoms.contains("chest pain") || symptoms.contains("heart attack") ||
            symptoms.contains("difficulty breathing") || symptoms.contains("shortness of breath") ||
            symptoms.contains("stroke") || symptoms.contains("paralysis") ||
            symptoms.contains("loss of consciousness") || symptoms.contains("heavy bleeding") ||
            symptoms.contains("crushing pain") || symptoms.contains("unconscious")) {

            response.setEmergency(true);
            response.setSeverityLevel("CRITICAL");
            response.setEmergencyMessage("This may require urgent medical attention. " +
                    "Please contact emergency medical services (108/112 in Kerala) or visit the nearest emergency department immediately.");
            response.setGeneralExplanation("The symptoms reported indicate potential acute cardiovascular, respiratory, or neurological distress requiring immediate medical evaluation.");
            response.setPossibleConditions(Arrays.asList("Acute Coronary Syndrome", "Severe Respiratory Distress", "Acute Neurological Event"));
            response.setRecommendedDepartment("Emergency Medicine / Cardiology");
            response.setSuggestedNextStep("Seek immediate emergency medical care without delay.");
            return response;
        }

        // 2. Cardiac / Chest Context
        if (symptoms.contains("palpitation") || symptoms.contains("fast heartbeat") || symptoms.contains("dizziness")) {
            response.setEmergency(false);
            response.setSeverityLevel("MODERATE");
            response.setGeneralExplanation("These symptoms are often related to arrhythmias, anxiety, dehydration, or cardiovascular strain.");
            response.setPossibleConditions(Arrays.asList("Tachycardia", "Mild Arrhythmia", "Stress/Anxiety Response", "Electrolyte Imbalance"));
            response.setRecommendedDepartment("Cardiology");
            response.setSuggestedNextStep("Schedule an in-person consultation with a cardiologist for an ECG and assessment.");
            return response;
        }

        // 3. Respiratory / Flu Context
        if (symptoms.contains("fever") || symptoms.contains("cough") || symptoms.contains("sore throat") ||
            symptoms.contains("cold") || symptoms.contains("runny nose")) {
            response.setEmergency(false);
            response.setSeverityLevel("LOW");
            response.setGeneralExplanation("These symptoms are commonly associated with upper respiratory tract infections or seasonal viral illnesses.");
            response.setPossibleConditions(Arrays.asList("Viral Pharyngitis", "Common Cold / Influenza", "Acute Bronchitis", "Allergic Rhinitis"));
            response.setRecommendedDepartment("General Medicine");
            response.setSuggestedNextStep("Rest, maintain hydration, and consult a General Physician if symptoms persist past 3-5 days.");
            return response;
        }

        // 4. Skin / Dermatological
        if (symptoms.contains("rash") || symptoms.contains("itch") || symptoms.contains("skin") ||
            symptoms.contains("acne") || symptoms.contains("allergy") || symptoms.contains("redness")) {
            response.setEmergency(false);
            response.setSeverityLevel("LOW");
            response.setGeneralExplanation("Skin eruptions and itching can stem from contact dermatitis, viral exanthems, or allergic reactions.");
            response.setPossibleConditions(Arrays.asList("Contact Dermatitis", "Urticaria (Hives)", "Eczema", "Fungal Skin Infection"));
            response.setRecommendedDepartment("Dermatology");
            response.setSuggestedNextStep("Avoid scratching or applying unverified creams; book an appointment with a Dermatologist.");
            return response;
        }

        // 5. Bone / Joint / Musculoskeletal
        if (symptoms.contains("joint") || symptoms.contains("knee") || symptoms.contains("back pain") ||
            symptoms.contains("fracture") || symptoms.contains("swelling") || symptoms.contains("shoulder")) {
            response.setEmergency(false);
            response.setSeverityLevel("MODERATE");
            response.setGeneralExplanation("Musculoskeletal pain is frequently linked to joint inflammation, ligament sprains, or disc pathology.");
            response.setPossibleConditions(Arrays.asList("Osteoarthritis", "Lumbar Muscle Strain", "Tendinitis", "Ligament Sprain"));
            response.setRecommendedDepartment("Orthopedics");
            response.setSuggestedNextStep("Avoid heavy lifting and consult an Orthopedic Specialist for an X-ray or physical evaluation.");
            return response;
        }

        // 6. Neurological / Headaches
        if (symptoms.contains("headache") || symptoms.contains("migraine") || symptoms.contains("numbness")) {
            response.setEmergency(false);
            response.setSeverityLevel("MODERATE");
            response.setGeneralExplanation("Headaches may arise from stress, tension, vascular changes, or sinus pressure.");
            response.setPossibleConditions(Arrays.asList("Tension-Type Headache", "Migraine", "Sinusitis", "Cervicogenic Headache"));
            response.setRecommendedDepartment("Neurology");
            response.setSuggestedNextStep("Keep a headache journal and schedule a consultation with a Neurologist.");
            return response;
        }

        // 7. Pediatric Symptoms
        if (symptoms.contains("child") || symptoms.contains("infant") || symptoms.contains("baby") || symptoms.contains("toddler")) {
            response.setEmergency(false);
            response.setSeverityLevel("MODERATE");
            response.setGeneralExplanation("Pediatric symptoms require prompt gentle care tailored to developing immune systems.");
            response.setPossibleConditions(Arrays.asList("Pediatric Viral Infection", "Teething Irritation", "Childhood Allergy"));
            response.setRecommendedDepartment("Pediatrics");
            response.setSuggestedNextStep("Consult a Pediatrician for age-appropriate evaluation and treatment.");
            return response;
        }

        // Default Fallback
        response.setEmergency(false);
        response.setSeverityLevel("LOW");
        response.setGeneralExplanation("These symptoms can be associated with several non-specific conditions. A preliminary clinical checkup will help identify the root cause.");
        response.setPossibleConditions(Arrays.asList("General Fatigue", "Mild Viral Syndrome", "Environmental Stressor"));
        response.setRecommendedDepartment("General Medicine");
        response.setSuggestedNextStep("Schedule an appointment with a General Physician for a routine clinical examination.");
        return response;
    }
}
