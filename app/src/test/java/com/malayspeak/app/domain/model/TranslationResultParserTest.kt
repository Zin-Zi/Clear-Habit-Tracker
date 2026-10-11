package com.malayspeak.app.domain.model

import com.malayspeak.app.data.remote.dto.TranslationResponse
import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class TranslationResultParserTest {
    
    private val json = Json { ignoreUnknownKeys = true }
    
    @Test
    fun `parses valid translation response`() {
        val responseJson = """
            {
                "myanmar": "မင်္ဂလာပါ",
                "english": "Hello",
                "malay": "Hai",
                "explanation": "Casual greeting in Malaysian Malay"
            }
        """.trimIndent()
        
        val result = json.decodeFromString<TranslationResult>(responseJson)
        
        assertNotNull(result)
        assertEquals("မင်္ဂလာပါ", result.myanmar)
        assertEquals("Hello", result.english)
        assertEquals("Hai", result.malay)
        assertEquals("Casual greeting in Malaysian Malay", result.explanation)
    }
    
    @Test
    fun `parses translation result to display strings`() {
        val result = TranslationResult(
            myanmar = "မင်္ဂလာပါ",
            english = "Hello",
            malay = "Hai",
            explanation = "Casual greeting"
        )
        
        val displayStrings = result.toDisplayStrings()
        
        assertEquals(3, displayStrings.size)
        assertEquals("မြန်မာ", displayStrings[0].languageName)
        assertEquals("မင်္ဂလာပါ", displayStrings[0].text)
        assertEquals("🇲🇲", displayStrings[0].flagEmoji)
        
        assertEquals("English", displayStrings[1].languageName)
        assertEquals("Hello", displayStrings[1].text)
        assertEquals("🇬🇧", displayStrings[1].flagEmoji)
        
        assertEquals("Bahasa Melayu", displayStrings[2].languageName)
        assertEquals("Hai", displayStrings[2].text)
        assertEquals("🇲🇾", displayStrings[2].flagEmoji)
    }
}