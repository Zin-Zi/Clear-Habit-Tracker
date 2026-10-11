package com.malayspeak.app.presentation.common.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Brand Colors - Teal/Green theme for language learning
private val LightColorPalette = lightColorScheme(
    primary = Color(0xFF006D5B),       // Deep teal
    onPrimary = Color.White,
    primaryContainer = Color(0xFF84FAC6),
    onPrimaryContainer = Color(0xFF00211A),
    secondary = Color(0xFF4A6B5A),     // Muted teal
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFCCEFD9),
    onSecondaryContainer = Color(0xFF092016),
    tertiary = Color(0xFF6C5800),      // Gold accent
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFFFE080),
    onTertiaryContainer = Color(0xFF221B00),
    error = Color(0xFFBA1A1A),
    onError = Color.White,
    errorContainer = Color(0xFFFFDAD6),
    onErrorContainer = Color(0xFF410002),
    surface = Color(0xFFFAFDFB),
    onSurface = Color(0xFF191D1C),
    surfaceContainerHighest = Color(0xFFE0E4E0),
    onSurfaceVariant = Color(0xFF434842),
    outline = Color(0xFF737872),
    outlineVariant = Color(0xFFC3C8C1),
    shadow = Color(0xFF000000),
    scrim = Color(0xFF000000),
    inverseSurface = Color(0xFF2E3130),
    inverseOnSurface = Color(0xFFF0F1EF),
    inversePrimary = Color(0xFF66DDB4),
)

private val DarkColorPalette = darkColorScheme(
    primary = Color(0xFF66DDB4),
    onPrimary = Color(0xFF00382E),
    primaryContainer = Color(0xFF005244),
    onPrimaryContainer = Color(0xFF84FAC6),
    secondary = Color(0xFFB0D3BE),
    onSecondary = Color(0xFF1F3327),
    secondaryContainer = Color(0xFF355241),
    onSecondaryContainer = Color(0xFFCCEFD9),
    tertiary = Color(0xFFE8C34A),
    onTertiary = Color(0xFF372D00),
    tertiaryContainer = Color(0xFF504400),
    onTertiaryContainer = Color(0xFFFFE080),
    error = Color(0xFFFFB4AB),
    onError = Color(0xFF690005),
    errorContainer = Color(0xFF93000A),
    onErrorContainer = Color(0xFFFFDAD6),
    surface = Color(0xFF191D1C),
    onSurface = Color(0xFFE3E4E1),
    surfaceContainerHighest = Color(0xFF434842),
    onSurfaceVariant = Color(0xFFC3C8C1),
    outline = Color(0xFF8D928C),
    outlineVariant = Color(0xFF434842),
    shadow = Color(0xFF000000),
    scrim = Color(0xFF000000),
    inverseSurface = Color(0xFFE3E4E1),
    inverseOnSurface = Color(0xFF2E3130),
    inversePrimary = Color(0xFF006D5B),
)

@Composable
fun MalaySpeakTheme(
    darkTheme: Boolean = MaterialTheme.colorScheme.isDark,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorPalette else LightColorPalette
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}