package com.malayspeak.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Entity(
    tableName = "vocabulary_cards",
    indices = [
        androidx.room.Index(value = ["malayPhrase"]),
        androidx.room.Index(value = ["englishMeaning"]),
        androidx.room.Index(value = ["myanmarMeaning"])
    ]
)
@Serializable
data class VocabularyCard(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val malayPhrase: String,
    val englishMeaning: String,
    val myanmarMeaning: String,
    val isLearned: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val learnedAt: Long? = null
) {
    fun markAsLearned(): VocabularyCard = copy(
        isLearned = true,
        learnedAt = System.currentTimeMillis()
    )
    
    fun markAsNotLearned(): VocabularyCard = copy(
        isLearned = false,
        learnedAt = null
    )
}