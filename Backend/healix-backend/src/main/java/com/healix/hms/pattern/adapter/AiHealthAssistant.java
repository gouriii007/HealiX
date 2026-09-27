package com.healix.hms.pattern.adapter;

import com.healix.hms.dto.AiAssessmentRequestDto;
import com.healix.hms.dto.AiAssessmentResponseDto;

/**
 * =====================================================================
 * AiHealthAssistant - ADAPTER PATTERN (Target Interface)
 * =====================================================================
 * Defines contract for AI symptom triage. Allows swapping between
 * MockAiAdapter and External (OpenAI/Gemini/Anthropic) Adapters without
 * changing calling code.
 * =====================================================================
 */
public interface AiHealthAssistant {
    AiAssessmentResponseDto assessSymptoms(AiAssessmentRequestDto request);
    String getProviderName();
}
