package com.malayspeak.app.domain.usecase

import com.malayspeak.app.data.local.entity.VocabularyCard
import com.malayspeak.app.domain.repository.VocabularyRepository
import com.malayspeak.app.util.Result
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class GetVocabularyCardsUseCase @Inject constructor(
    private val vocabularyRepository: VocabularyRepository
) {
    operator fun invoke(): Flow<List<VocabularyCard>> = vocabularyRepository.getAllCards()
    
    fun invokeSync(): Result<List<VocabularyCard>> = vocabularyRepository.getAllCardsSync()
}