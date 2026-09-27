package com.healix.hms.service;

import com.healix.hms.dto.AiAssessmentRequestDto;
import com.healix.hms.dto.AiAssessmentResponseDto;

public interface AiHealthAssistantService {
    AiAssessmentResponseDto getSymptomAssessment(AiAssessmentRequestDto request);
}
