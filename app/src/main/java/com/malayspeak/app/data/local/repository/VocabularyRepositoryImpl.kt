package com.malayspeak.app.data.local.repository

import com.malayspeak.app.data.local.dao.LearningProgressDao
import com.malayspeak.app.data.local.dao.VocabularyCardDao
import com.malayspeak.app.data.local.entity.LearningProgress
import com.malayspeak.app.data.local.entity.VocabularyCard
import com.malayspeak.app.domain.repository.VocabularyRepository
import com.malayspeak.app.util.Result
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class VocabularyRepositoryImpl @Inject constructor(
    private val vocabularyCardDao: VocabularyCardDao,
    private val learningProgressDao: LearningProgressDao
) : VocabularyRepository {
    
    override fun getAllCards(): Flow<List<VocabularyCard>> = vocabularyCardDao.getAllCards()
    
    override fun getAllCardsSync(): Result<List<VocabularyCard>> {
        return try {
            Result.success(vocabularyCardDao.getAllCardsSync())
        } catch (e: Exception) {
            Result.failure(e, "Failed to fetch vocabulary cards")
        }
    }
    
    override fun getLearnedCards(): Flow<List<VocabularyCard>> = vocabularyCardDao.getLearnedCards()
    
    override fun getUnlearnedCards(): Flow<List<VocabularyCard>> = vocabularyCardDao.getUnlearnedCards()
    
    override fun getTotalCount(): Flow<Int> = vocabularyCardDao.getTotalCount()
    
    override fun getLearnedCount(): Flow<Int> = vocabularyCardDao.getLearnedCount()
    
    override suspend fun markCardAsLearned(cardId: Long): Result<VocabularyCard> {
        return try {
            val card = vocabularyCardDao.getCardById(cardId)
            if (card != null) {
                val updatedCard = card.markAsLearned()
                vocabularyCardDao.update(updatedCard)
                updateProgress()
                Result.success(updatedCard)
            } else {
                Result.failure(IllegalArgumentException("Card not found: $cardId"), "Card not found")
            }
        } catch (e: Exception) {
            Result.failure(e, "Failed to mark card as learned")
        }
    }
    
    override suspend fun markCardAsNotLearned(cardId: Long): Result<VocabularyCard> {
        return try {
            val card = vocabularyCardDao.getCardById(cardId)
            if (card != null) {
                val updatedCard = card.markAsNotLearned()
                vocabularyCardDao.update(updatedCard)
                updateProgress()
                Result.success(updatedCard)
            } else {
                Result.failure(IllegalArgumentException("Card not found: $cardId"), "Card not found")
            }
        } catch (e: Exception) {
            Result.failure(e, "Failed to mark card as not learned")
        }
    }
    
    override fun getProgress(): Flow<LearningProgress> = learningProgressDao.getProgress()
    
    override suspend fun initializeProgress(totalCards: Int, learnedCards: Int): Result<LearningProgress> {
        return try {
            val progress = LearningProgress(id = 1).updateCounts(totalCards, learnedCards)
            learningProgressDao.insert(progress)
            Result.success(progress)
        } catch (e: Exception) {
            Result.failure(e, "Failed to initialize progress")
        }
    }
    
    private suspend fun updateProgress() {
        val total = vocabularyCardDao.getTotalCountSync()
        val learned = vocabularyCardDao.getLearnedCountSync()
        val progress = LearningProgress(id = 1).updateCounts(total, learned)
        learningProgressDao.insert(progress)
    }
    
    // Helper sync methods
    private suspend fun VocabularyCardDao.getTotalCountSync(): Int {
        // This is a workaround - in real app we'd add sync method to DAO
        return getAllCardsSync().size
    }
    
    private suspend fun VocabularyCardDao.getLearnedCountSync(): Int {
        return getAllCardsSync().count { it.isLearned }
    }
}