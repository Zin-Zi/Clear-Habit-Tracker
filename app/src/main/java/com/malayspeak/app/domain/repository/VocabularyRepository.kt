package com.malayspeak.app.domain.repository

import com.malayspeak.app.data.local.entity.LearningProgress
import com.malayspeak.app.data.local.entity.VocabularyCard
import com.malayspeak.app.util.Result
import kotlinx.coroutines.flow.Flow

interface VocabularyRepository {
    fun getAllCards(): Flow<List<VocabularyCard>>
    fun getAllCardsSync(): Result<List<VocabularyCard>>
    fun getLearnedCards(): Flow<List<VocabularyCard>>
    fun getUnlearnedCards(): Flow<List<VocabularyCard>>
    fun getTotalCount(): Flow<Int>
    fun getLearnedCount(): Flow<Int>
    suspend fun markCardAsLearned(cardId: Long): Result<VocabularyCard>
    suspend fun markCardAsNotLearned(cardId: Long): Result<VocabularyCard>
    fun getProgress(): Flow<LearningProgress>
    suspend fun initializeProgress(totalCards: Int, learnedCards: Int): Result<LearningProgress>
}