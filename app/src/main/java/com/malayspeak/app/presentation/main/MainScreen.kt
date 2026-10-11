package com.malayspeak.app.presentation.main

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.BottomNavigation
import androidx.compose.material3.BottomNavigationItem
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.malayspeak.app.R
import com.malayspeak.app.presentation.onboarding.OnboardingScreen
import com.malayspeak.app.presentation.progress.ProgressScreen
import com.malayspeak.app.presentation.translate.TranslateScreen
import com.malayspeak.app.presentation.vocabulary.VocabularyScreen
import com.malayspeak.app.presentation.common.theme.MalaySpeakTheme
import com.malayspeak.app.presentation.common.theme.MalaySpeakSurface

@Composable
fun MainScreen(navController: androidx.navigation.NavHostController) {
    val viewModel: MainViewModel = hiltViewModel()
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    
    MalaySpeakTheme {
        MalaySpeakSurface(modifier = Modifier.fillMaxSize()) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Main content area
                Box(modifier = Modifier
                    .fillMaxSize()
                    .padding(bottom = 80.dp) // Space for bottom nav
                ) {
                    NavHost(navController, startDestination = "translate") {
                        composable("translate") {
                            TranslateScreen()
                        }
                        composable("vocabulary") {
                            VocabularyScreen()
                        }
                        composable("progress") {
                            ProgressScreen()
                        }
                    }
                }
                
                // Bottom Navigation
                NavigationBar(
                    modifier = Modifier.fillMaxWidth(),
                    containerColor = MalaySpeakTheme.colorScheme.surfaceContainerHighest.copy(alpha = 0.95f)
                ) {
                    NavigationBarItem(
                        icon = { Icon(imageVector = getIcon(MainTab.Translate), contentDescription = null) },
                        label = { Text(stringResource(R.string.translate_tab), fontSize = 12.sp) },
                        selected = currentRoute == "translate",
                        onClick = { navController.navigate("translate") { popUpTo("translate") { inclusive = true } } },
                        colors = androidx.compose.material3.NavigationBarItemDefaults.colors(
                            selectedIconColor = MalaySpeakTheme.colorScheme.primary,
                            selectedLabelColor = MalaySpeakTheme.colorScheme.primary,
                            unselectedIconColor = MalaySpeakTheme.colorScheme.onSurfaceVariant,
                            unselectedLabelColor = MalaySpeakTheme.colorScheme.onSurfaceVariant
                        )
                    )
                    NavigationBarItem(
                        icon = { Icon(imageVector = getIcon(MainTab.Vocabulary), contentDescription = null) },
                        label = { Text(stringResource(R.string.vocabulary_tab), fontSize = 12.sp) },
                        selected = currentRoute == "vocabulary",
                        onClick = { navController.navigate("vocabulary") { popUpTo("vocabulary") { inclusive = true } } },
                        colors = androidx.compose.material3.NavigationBarItemDefaults.colors(
                            selectedIconColor = MalaySpeakTheme.colorScheme.primary,
                            selectedLabelColor = MalaySpeakTheme.colorScheme.primary,
                            unselectedIconColor = MalaySpeakTheme.colorScheme.onSurfaceVariant,
                            unselectedLabelColor = MalaySpeakTheme.colorScheme.onSurfaceVariant
                        )
                    )
                    NavigationBarItem(
                        icon = { Icon(imageVector = getIcon(MainTab.Progress), contentDescription = null) },
                        label = { Text(stringResource(R.string.progress_tab), fontSize = 12.sp) },
                        selected = currentRoute == "progress",
                        onClick = { navController.navigate("progress") { popUpTo("progress") { inclusive = true } } },
                        colors = androidx.compose.material3.NavigationBarItemDefaults.colors(
                            selectedIconColor = MalaySpeakTheme.colorScheme.primary,
                            selectedLabelColor = MalaySpeakTheme.colorScheme.primary,
                            unselectedIconColor = MalaySpeakTheme.colorScheme.onSurfaceVariant,
                            unselectedLabelColor = MalaySpeakTheme.colorScheme.onSurfaceVariant
                        )
                    )
                }
            }
        }
    }
}

private fun getIcon(tab: MainTab): androidx.compose.ui.graphics.vector.ImageVector {
    return when (tab) {
        MainTab.Translate -> androidx.compose.material.icons.Icons.Default.Translate
        MainTab.Vocabulary -> androidx.compose.material.icons.Icons.Default.MenuBook
        MainTab.Progress -> androidx.compose.material.icons.Icons.Default.TrendingUp
    }
}