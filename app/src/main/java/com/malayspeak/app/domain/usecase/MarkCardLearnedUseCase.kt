package com.malayspeak.app.domain.usecase

import com.malayspeak.app.data.local.entity.VocabularyCard
import com.malayspeak.app.domain.repository.VocabularyRepository
import com.malayspeak.app.util.Result
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MarkCardLearnedUseCase @Inject constructor(
    private val vocabularyRepository: VocabularyRepository
) {
    operator fun invoke(cardId: Long, isLearned: Boolean): Result<VocabularyCard> {
        return if (isLearned) {
            vocabularyRepository.markCardAsLearned(cardId)
        } else {
            vocabularyRepository.markCardAsNotLearned(cardId)
        }
    }
}