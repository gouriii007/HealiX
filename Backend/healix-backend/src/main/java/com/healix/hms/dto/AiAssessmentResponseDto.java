package com.healix.hms.dto;

import java.util.List;

public class AiAssessmentResponseDto {
    private boolean emergency;
    private String emergencyMessage;
    private String severityLevel; // LOW, MODERATE, HIGH, CRITICAL
    private String generalExplanation;
    private List<String> possibleConditions;
    private String recommendedDepartment;
    private String suggestedNextStep;
    private String disclaimer;

    public AiAssessmentResponseDto() {
        this.disclaimer = "MediCare AI provides general health information and preliminary symptom guidance. " +
                "It does not provide a medical diagnosis. For persistent, severe, or emergency symptoms, " +
                "consult a qualified healthcare professional or seek emergency medical care.";
    }

    public boolean isEmergency() { return emergency; }
    public void setEmergency(boolean emergency) { this.emergency = emergency; }

    public String getEmergencyMessage() { return emergencyMessage; }
    public void setEmergencyMessage(String emergencyMessage) { this.emergencyMessage = emergencyMessage; }

    public String getSeverityLevel() { return severityLevel; }
    public void setSeverityLevel(String severityLevel) { this.severityLevel = severityLevel; }

    public String getGeneralExplanation() { return generalExplanation; }
    public void setGeneralExplanation(String generalExplanation) { this.generalExplanation = generalExplanation; }

    public List<String> getPossibleConditions() { return possibleConditions; }
    public void setPossibleConditions(List<String> possibleConditions) { this.possibleConditions = possibleConditions; }

    public String getRecommendedDepartment() { return recommendedDepartment; }
    public void setRecommendedDepartment(String recommendedDepartment) { this.recommendedDepartment = recommendedDepartment; }

    public String getSuggestedNextStep() { return suggestedNextStep; }
    public void setSuggestedNextStep(String suggestedNextStep) { this.suggestedNextStep = suggestedNextStep; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
}
