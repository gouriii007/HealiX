package com.healix.hms.controller;

import com.healix.hms.dto.AiAssessmentRequestDto;
import com.healix.hms.dto.AiAssessmentResponseDto;
import com.healix.hms.service.AiHealthAssistantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for interactive AI symptom triage dialog
 */
@RestController
@RequestMapping("/api/ai")
public class AiChatController {

    private final AiHealthAssistantService aiHealthAssistantService;

    public AiChatController(AiHealthAssistantService aiHealthAssistantService) {
        this.aiHealthAssistantService = aiHealthAssistantService;
    }

    @PostMapping("/assess")
    public ResponseEntity<AiAssessmentResponseDto> assessSymptoms(@RequestBody AiAssessmentRequestDto request) {
        AiAssessmentResponseDto response = aiHealthAssistantService.getSymptomAssessment(request);
        return ResponseEntity.ok(response);
    }
}
