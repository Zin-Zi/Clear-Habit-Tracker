package com.malayspeak.app.presentation.progress

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.malayspeak.app.data.local.entity.LearningProgress
import com.malayspeak.app.domain.usecase.GetProgressUseCase
import com.malayspeak.app.domain.usecase.GetVocabularyCardsUseCase
import com.malayspeak.app.util.Result
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch
import javax.inject.Inject
import dagger.hilt.android.lifecycle.HiltViewModel

@HiltViewModel
class ProgressViewModel @Inject constructor(
    private val getProgressUseCase: GetProgressUseCase,
    private val getVocabularyCardsUseCase: GetVocabularyCardsUseCase
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(ProgressUiState())
    val uiState = _uiState.asStateFlow()
    
    init {
        viewModelScope.launch {
            val progressFlow = getProgressUseCase()
            val cardsFlow = getVocabularyCardsUseCase()
            
            combine(progressFlow, cardsFlow) { progress, cards ->
                val totalCards = cards.size
                val learnedCards = cards.count { it.isLearned }
                
                // Update progress if counts don't match
                if (progress.totalCards != totalCards || progress.learnedCards != learnedCards) {
                    getProgressUseCase.initialize(totalCards, learnedCards)
                }
                
                ProgressUiState(
                    progress = progress,
                    totalCards = totalCards,
                    learnedCards = learnedCards
                )
            }.collect { state ->
                _uiState.update { state }
            }
        }
    }
}

data class ProgressUiState(
    val progress: LearningProgress = LearningProgress(),
    val totalCards: Int = 0,
    val learnedCards: Int = 0
) {
    val progressPercentage: Float
        get() = if (totalCards > 0) (learnedCards.toFloat() / totalCards) * 100 else 0f
}