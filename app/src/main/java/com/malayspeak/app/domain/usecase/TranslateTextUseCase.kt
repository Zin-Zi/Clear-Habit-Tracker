package com.malayspeak.app.domain.usecase

import com.malayspeak.app.domain.model.TranslationResult
import com.malayspeak.app.domain.repository.TranslationRepository
import com.malayspeak.app.util.Result
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TranslateTextUseCase @Inject constructor(
    private val translationRepository: TranslationRepository
) {
    operator fun invoke(text: String): Result<TranslationResult> {
        if (text.trim().isEmpty()) {
            return Result.failure(IllegalArgumentException("Text cannot be empty"), "Please enter text to translate")
        }
        return translationRepository.translate(text.trim())
    }
}