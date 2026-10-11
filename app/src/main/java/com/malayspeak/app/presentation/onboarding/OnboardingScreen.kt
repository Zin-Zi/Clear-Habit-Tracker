package com.malayspeak.app.presentation.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.spacer
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
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
import com.malayspeak.app.R
import com.malayspeak.app.presentation.common.theme.MalaySpeakTheme
import com.malayspeak.app.presentation.common.theme.MalaySpeakSurface

@Composable
fun OnboardingScreen(onFinish: () -> Unit) {
    MalaySpeakTheme {
        MalaySpeakSurface(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // App Icon/Logo
                Card(
                    modifier = Modifier.size(120.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MalaySpeakTheme.colorScheme.primaryContainer
                    ),
                    shape = com.malayspeak.app.presentation.common.theme.MalaySpeakTheme.shapes.extraLarge
                ) {
                    Text(
                        text = "မလေး",
                        fontSize = 48.sp,
                        fontWeight = FontWeight.Bold,
                        color = MalaySpeakTheme.colorScheme.onPrimaryContainer,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(16.dp)
                    )
                }
                
                androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(24.dp))
                
                // Title
                Text(
                    text = stringResource(R.string.onboarding_title),
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = MalaySpeakTheme.colorScheme.onSurface,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 24.dp)
                )
                
                androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(16.dp))
                
                // Subtitle
                Text(
                    text = stringResource(R.string.onboarding_subtitle),
                    fontSize = 16.sp,
                    color = MalaySpeakTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 24.dp)
                )
                
                androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(32.dp))
                
                // Features
                Column(
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier.padding(horizontal = 24.dp).fillMaxWidth()
                ) {
                    OnboardingFeatureItem(
                        icon = "🔄",
                        title = stringResource(R.string.onboarding_feature_translate)
                    )
                    OnboardingFeatureItem(
                        icon = "📚",
                        title = stringResource(R.string.onboarding_feature_vocabulary)
                    )
                    OnboardingFeatureItem(
                        icon = "📊",
                        title = stringResource(R.string.onboarding_feature_progress)
                    )
                }
                
                androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(48.dp))
                
                // Get Started Button
                Button(
                    onClick = onFinish,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp)
                        .height(56.dp),
                    colors = androidx.compose.material3.ButtonDefaults.buttonColors(
                        containerColor = MalaySpeakTheme.colorScheme.primary,
                        contentColor = MalaySpeakTheme.colorScheme.onPrimary
                    )
                ) {
                    Text(
                        text = stringResource(R.string.onboarding_get_started),
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }
    }
}

@Composable
private fun OnboardingFeatureItem(icon: String, title: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = icon,
            fontSize = 28.sp,
            modifier = Modifier.size(48.dp)
        )
        Text(
            text = title,
            fontSize = 15.sp,
            color = MalaySpeakTheme.colorScheme.onSurface,
            modifier = Modifier.weight(1f)
        )
    }
}