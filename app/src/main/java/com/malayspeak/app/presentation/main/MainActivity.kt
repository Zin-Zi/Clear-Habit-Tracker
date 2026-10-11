package com.malayspeak.app.presentation.main

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.malayspeak.app.R
import com.malayspeak.app.presentation.onboarding.OnboardingScreen
import com.malayspeak.app.presentation.translate.TranslateScreen
import com.malayspeak.app.presentation.vocabulary.VocabularyScreen
import com.malayspeak.app.presentation.progress.ProgressScreen
import com.malayspeak.app.presentation.common.theme.MalaySpeakTheme
import com.malayspeak.app.presentation.common.theme.MalaySpeakSurface
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    private val mainViewModel: MainViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MalaySpeakTheme {
                val navController = rememberNavController()
                val uiState by mainViewModel.uiState.collectAsStateWithLifecycle()
                
                val startDestination = if (uiState.hasSeenOnboarding) "main" else "onboarding"
                
                AppNavHost(navController, startDestination = startDestination)
            }
        }
    }
}