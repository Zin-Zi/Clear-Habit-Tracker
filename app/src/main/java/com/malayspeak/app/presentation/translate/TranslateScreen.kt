package com.malayspeak.app.presentation.translate

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.spacer
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.text.KeyboardType
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.malayspeak.app.R
import com.malayspeak.app.domain.model.TranslationResult
import com.malayspeak.app.presentation.common.component.LanguageChip
import com.malayspeak.app.presentation.common.theme.MalaySpeakTheme
import com.malayspeak.app.presentation.common.theme.MalaySpeakSurface
import com.malayspeak.app.util.copyToClipboard

@Composable
fun TranslateScreen(
    viewModel: TranslateViewModel = androidx.hilt.navigation.compose.hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    var inputText by remember { mutableStateOf("") }
    
    MalaySpeakTheme {
        MalaySpeakSurface(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header
                Text(
                    text = stringResource(R.string.translate_tab),
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = MalaySpeakTheme.colorScheme.onSurface
                )
                
                // Input Field
                TextField(
                    value = inputText,
                    onValueChange = { inputText = it },
                    label = { Text(stringResource(R.string.translate_hint)) },
                    placeholder = { Text(stringResource(R.string.translate_hint)) },
                    singleLine = false,
                    minLines = 3,
                    maxLines = 5,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text),
                    modifier = Modifier.fillMaxWidth(),
                    colors = TextFieldDefaults.textFieldColors(
                        focusedContainerColor = MalaySpeakTheme.colorScheme.surfaceContainerHighest
                    )
                )
                
                // Translate Button
                Button(
                    onClick = { viewModel.translate(inputText) },
                    enabled = inputText.trim().isNotEmpty() && !uiState.isLoading,
                    modifier = Modifier.fillMaxWidth().height(56.dp),
                    colors = androidx.compose.material3.ButtonDefaults.buttonColors(
                        containerColor = MalaySpeakTheme.colorScheme.primary,
                        contentColor = MalaySpeakTheme.colorScheme.onPrimary,
                        disabledContainerColor = MalaySpeakTheme.colorScheme.surfaceContainerHighest
                    )
                ) {
                    if (uiState.isLoading) {
                        androidx.compose.material3.CircularProgressIndicator(
                            color = MalaySpeakTheme.colorScheme.onPrimary,
                            modifier = Modifier.size(24.dp)
                        )
                    } else {
                        Text(
                            text = stringResource(R.string.translate_button),
                            fontSize = 18.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
                
                // Error Message
                uiState.error?.let { error ->
                    Text(
                        text = error,
                        color = MalaySpeakTheme.colorScheme.error,
                        fontSize = 14.sp,
                        modifier = Modifier.fillMaxWidth().wrapContentSize()
                    )
                }
                
                // Result
                uiState.result?.let { result ->
                    TranslationResultCard(result = result)
                }
                
                androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(16.dp))
            }
        }
    }
}

@Composable
private fun TranslationResultCard(result: TranslationResult) {
    Column(modifier = Modifier.fillMaxWidth()) {
        // Language Chips
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(8.dp)
        ) {
            result.toDisplayStrings().forEach { display ->
                LanguageChip(display = display)
            }
        }
        
        androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(16.dp))
        
        // Explanation Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MalaySpeakTheme.colorScheme.surfaceContainerHighest
            )
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "💡",
                        fontSize = 20.sp
                    )
                    Text(
                        text = stringResource(R.string.translate_explanation),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MalaySpeakTheme.colorScheme.primary
                    )
                }
                
                androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 8.dp))
                
                Text(
                    text = result.explanation,
                    fontSize = 14.sp,
                    color = MalaySpeakTheme.colorScheme.onSurfaceVariant,
                    lineHeight = 20.sp
                )
            }
        }
    }
}

@Composable
fun CopyableText(text: String, label: String) {
    val context = LocalContext.current
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = androidx.compose.foundation.layout.Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = text,
            fontSize = 16.sp,
            fontWeight = FontWeight.Medium,
            color = MalaySpeakTheme.colorScheme.onSurface,
            maxLines = 3,
            overflow = androidx.compose.ui.text.TextOverflow.Ellipsis,
            modifier = Modifier.weight(1f).padding(end = 16.dp)
        )
        IconButton(onClick = { text.copyToClipboard(context, label) }) {
            Icon(
                imageVector = androidx.compose.material.icons.Icons.Default.ContentCopy,
                contentDescription = "Copy $label"
            )
        }
    }
}