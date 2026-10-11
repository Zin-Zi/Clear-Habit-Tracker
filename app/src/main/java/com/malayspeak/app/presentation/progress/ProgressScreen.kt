package com.malayspeak.app.presentation.progress

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.spacer
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
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
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.malayspeak.app.R
import com.malayspeak.app.presentation.common.theme.MalaySpeakTheme
import com.malayspeak.app.presentation.common.theme.MalaySpeakSurface

@Composable
fun ProgressScreen(
    viewModel: ProgressViewModel = androidx.hilt.navigation.compose.hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    MalaySpeakTheme {
        MalaySpeakSurface(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                verticalArrangement = Arrangement.spacedBy(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Title
                Text(
                    text = stringResource(R.string.progress_title),
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = MalaySpeakTheme.colorScheme.onSurface
                )
                
                // Progress Circle
                Box(
                    modifier = Modifier.size(200.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(
                        progress = uiState.progressPercentage / 100f,
                        strokeWidth = 16.dp,
                        modifier = Modifier.size(200.dp),
                        color = MalaySpeakTheme.colorScheme.primary,
                        trackColor = MalaySpeakTheme.colorScheme.surfaceContainerHighest
                    )
                    
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "%.0f%%".format(uiState.progressPercentage),
                            fontSize = 48.sp,
                            fontWeight = FontWeight.Bold,
                            color = MalaySpeakTheme.colorScheme.onSurface
                        )
                        Text(
                            text = stringResource(R.string.progress_percentage),
                            fontSize = 16.sp,
                            color = MalaySpeakTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                
                // Stats Cards
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatCard(
                        label = stringResource(R.string.progress_learned_count),
                        value = uiState.learnedCards.toString(),
                        icon = "✓",
                        color = MalaySpeakTheme.colorScheme.primary
                    )
                    
                    StatCard(
                        label = stringResource(R.string.progress_total_count),
                        value = uiState.totalCards.toString(),
                        icon = "📚",
                        color = MalaySpeakTheme.colorScheme.secondary
                    )
                    
                    StatCard(
                        label = "Remaining",
                        value = (uiState.totalCards - uiState.learnedCards).toString(),
                        icon = "⏳",
                        color = MalaySpeakTheme.colorScheme.tertiary
                    )
                }
                
                androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(16.dp))
                
                // Encouragement message
                Text(
                    text = stringResource(R.string.progress_keep_going),
                    fontSize = 16.sp,
                    color = MalaySpeakTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}

@Composable
private fun StatCard(label: String, value: String, icon: String, color: Color) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MalaySpeakTheme.colorScheme.surfaceContainerHighest
        )
    ) {
        Row(
            modifier = Modifier.padding(24.dp),
            horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = icon, fontSize = 28.sp)
            Column {
                Text(
                    text = label,
                    fontSize = 14.sp,
                    color = MalaySpeakTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = value,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = color
                )
            }
        }
    }
}