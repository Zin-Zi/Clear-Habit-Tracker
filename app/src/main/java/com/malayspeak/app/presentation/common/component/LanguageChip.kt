package com.malayspeak.app.presentation.common.component

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.spacer
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.malayspeak.app.domain.model.DisplayTranslation
import com.malayspeak.app.presentation.common.theme.MalaySpeakTheme

@Composable
fun LanguageChip(display: DisplayTranslation) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MalaySpeakTheme.colorScheme.surfaceContainerHighest
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = display.flagEmoji, fontSize = 20.sp)
                Text(
                    text = display.languageName,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MalaySpeakTheme.colorScheme.primary
                )
            }
            
            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 8.dp))
            
            Text(
                text = display.text,
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium,
                color = MalaySpeakTheme.colorScheme.onSurface,
                maxLines = 3,
                overflow = androidx.compose.ui.text.TextOverflow.Ellipsis,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}