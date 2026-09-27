package com.healix.hms.dto;

import java.util.List;

public class AiAssessmentRequestDto {
    private String symptoms;
    private String ageGroup;
    private String duration;

    public AiAssessmentRequestDto() {}

    public AiAssessmentRequestDto(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public String getAgeGroup() { return ageGroup; }
    public void setAgeGroup(String ageGroup) { this.ageGroup = ageGroup; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
}
