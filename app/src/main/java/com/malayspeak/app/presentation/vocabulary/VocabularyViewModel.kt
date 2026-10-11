package com.malayspeak.app.presentation.vocabulary

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.malayspeak.app.data.local.entity.VocabularyCard
import com.malayspeak.app.domain.usecase.GetVocabularyCardsUseCase
import com.malayspeak.app.domain.usecase.MarkCardLearnedUseCase
import com.malayspeak.app.util.Result
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch
import javax.inject.Inject
import dagger.hilt.android.lifecycle.HiltViewModel

@HiltViewModel
class VocabularyViewModel @Inject constructor(
    private val getVocabularyCardsUseCase: GetVocabularyCardsUseCase,
    private val markCardLearnedUseCase: MarkCardLearnedUseCase
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(VocabularyUiState())
    val uiState = _uiState.asStateFlow()
    
    val cardsFlow = getVocabularyCardsUseCase()
    
    init {
        viewModelScope.launch {
            cardsFlow.collect { cards ->
                _uiState.update { it.copy(cards = cards) }
            }
        }
    }
    
    fun onCardLearnedChanged(card: VocabularyCard, isLearned: Boolean) {
        viewModelScope.launch {
            val result = markCardLearnedUseCase(card.id, isLearned)
            if (result.isFailure()) {
                // Could show error toast here
            }
        }
    }
    
    fun getCurrentCard(index: Int): VocabularyCard? {
        return _uiState.value.cards.getOrNull(index)
    }
}

data class VocabularyUiState(
    val cards: List<VocabularyCard> = emptyList(),
    val currentIndex: Int = 0
)