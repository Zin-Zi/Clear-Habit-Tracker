package com.malayspeak.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Entity(tableName = "learning_progress")
@Serializable
data class LearningProgress(
    @PrimaryKey
    val id: Int = 1, // Singleton - only one row
    val totalCards: Int = 0,
    val learnedCards: Int = 0,
    val lastUpdated: Long = System.currentTimeMillis()
) {
    val progressPercentage: Float
        get() = if (totalCards > 0) (learnedCards.toFloat() / totalCards) * 100 else 0f
    
    fun updateCounts(total: Int, learned: Int): LearningProgress = copy(
        totalCards = total,
        learnedCards = learned,
        lastUpdated = System.currentTimeMillis()
    )
}