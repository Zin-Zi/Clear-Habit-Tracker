package com.malayspeak.app.presentation.main

import androidx.compose.runtime.Composable
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.malayspeak.app.presentation.onboarding.OnboardingScreen
import com.malayspeak.app.presentation.translate.TranslateScreen
import com.malayspeak.app.presentation.vocabulary.VocabularyScreen
import com.malayspeak.app.presentation.progress.ProgressScreen

@Composable
fun AppNavHost(navController: NavHostController, startDestination: String = "onboarding") {
    NavHost(navController, startDestination = startDestination) {
        composable("onboarding") {
            OnboardingScreen(onFinish = { navController.navigate("main") { popUpTo("onboarding") { inclusive = true } } })
        }
        
        composable("main") {
            MainScreen(navController = navController)
        }
    }
}

@Composable
fun RememberNavHost(): NavHostController {
    val navController = rememberNavController()
    AppNavHost(navController)
    return navController
}

// Screen routes
object Routes {
    const val ONBOARDING = "onboarding"
    const val MAIN = "main"
}