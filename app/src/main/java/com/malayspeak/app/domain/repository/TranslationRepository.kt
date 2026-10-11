package com.malayspeak.app.domain.repository

import com.malayspeak.app.domain.model.TranslationResult
import com.malayspeak.app.util.Result

interface TranslationRepository {
    suspend fun translate(text: String): Result<TranslationResult>
}