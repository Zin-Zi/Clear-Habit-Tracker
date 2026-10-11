package com.malayspeak.app.domain.usecase

import com.malayspeak.app.data.local.entity.LearningProgress
import com.malayspeak.app.domain.repository.VocabularyRepository
import com.malayspeak.app.util.Result
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class GetProgressUseCase @Inject constructor(
    private val vocabularyRepository: VocabularyRepository
) {
    operator fun invoke(): Flow<LearningProgress> = vocabularyRepository.getProgress()
    
    suspend fun initialize(totalCards: Int, learnedCards: Int): Result<LearningProgress> {
        return vocabularyRepository.initializeProgress(totalCards, learnedCards)
    }
}