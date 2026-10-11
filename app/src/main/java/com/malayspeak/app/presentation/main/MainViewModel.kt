package com.malayspeak.app.presentation.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.malayspeak.app.util.Result
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import dagger.hilt.android.lifecycle.HiltViewModel

@HiltViewModel
class MainViewModel @Inject constructor() : ViewModel() {
    
    private val _uiState = MutableStateFlow(MainUiState())
    val uiState = _uiState.asStateFlow()
    
    fun setOnboardingComplete() {
        _uiState.update { it.copy(hasSeenOnboarding = true) }
    }
    
    fun setSelectedTab(tab: MainTab) {
        _uiState.update { it.copy(selectedTab = tab) }
    }
}

data class MainUiState(
    val hasSeenOnboarding: Boolean = false,
    val selectedTab: MainTab = MainTab.Translate
)

enum class MainTab(val label: String, val icon: String) {
    Translate("ဘာသာပြန်ဆိုမှု", "translate"),
    Vocabulary("စကားစာလိုး", "vocabulary"),
    Progress("ကြိုးစားမှု", "progress")
}