package com.malayspeak.app.presentation.translate

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.malayspeak.app.domain.model.TranslationResult
import com.malayspeak.app.domain.usecase.TranslateTextUseCase
import com.malayspeak.app.util.Result
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import dagger.hilt.android.lifecycle.HiltViewModel

@HiltViewModel
class TranslateViewModel @Inject constructor(
    private val translateTextUseCase: TranslateTextUseCase
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(TranslateUiState())
    val uiState = _uiState.asStateFlow()
    
    fun translate(inputText: String) {
        if (inputText.trim().isEmpty()) {
            _uiState.update { it.copy(error = "Please enter text to translate") }
            return
        }
        
        _uiState.update { it.copy(isLoading = true, error = null) }
        
        viewModelScope.launch {
            val result = translateTextUseCase(inputText)
            _uiState.update { current ->
                when (result) {
                    is Result.Success -> current.copy(
                        isLoading = false,
                        result = result.data,
                        inputText = inputText,
                        error = null
                    )
                    is Result.Failure -> current.copy(
                        isLoading = false,
                        error = result.message ?: "Translation failed"
                    )
                }
            }
        }
    }
    
    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
    
    fun clearResult() {
        _uiState.update { it.copy(result = null, inputText = "") }
    }
}

data class TranslateUiState(
    val isLoading: Boolean = false,
    val result: TranslationResult? = null,
    val inputText: String = "",
    val error: String? = null
)