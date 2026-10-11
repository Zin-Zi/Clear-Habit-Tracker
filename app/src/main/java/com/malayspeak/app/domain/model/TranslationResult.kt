package com.malayspeak.app.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class TranslationResult(
    val myanmar: String,
    val english: String,
    val malay: String,
    val explanation: String
) {
    fun toDisplayStrings(): List<DisplayTranslation> = listOf(
        DisplayTranslation("မြန်မာ", myanmar, "🇲🇲"),
        DisplayTranslation("English", english, "🇬🇧"),
        DisplayTranslation("Bahasa Melayu", malay, "🇲🇾")
    )
}

@Serializable
data class DisplayTranslation(
    val languageName: String,
    val text: String,
    val flagEmoji: String
)