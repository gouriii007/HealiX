package com.healix.hms.service.impl;

import com.healix.hms.dto.AiAssessmentRequestDto;
import com.healix.hms.dto.AiAssessmentResponseDto;
import com.healix.hms.exception.AiServiceException;
import com.healix.hms.pattern.adapter.AiHealthAssistant;
import com.healix.hms.service.AiHealthAssistantService;
import org.springframework.stereotype.Service;

@Service
public class AiHealthAssistantServiceImpl implements AiHealthAssistantService {

    private final AiHealthAssistant aiHealthAssistant;

    public AiHealthAssistantServiceImpl(AiHealthAssistant aiHealthAssistant) {
        this.aiHealthAssistant = aiHealthAssistant;
    }

    @Override
    public AiAssessmentResponseDto getSymptomAssessment(AiAssessmentRequestDto request) {
        try {
            return aiHealthAssistant.assessSymptoms(request);
        } catch (Exception e) {
            throw new AiServiceException("Failed to process symptom assessment: " + e.getMessage(), e);
        }
    }
}
