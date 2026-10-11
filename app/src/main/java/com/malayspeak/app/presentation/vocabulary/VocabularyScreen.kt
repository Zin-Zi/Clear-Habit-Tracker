package com.malayspeak.app.presentation.vocabulary

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.spacer
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.google.accompanist.pager.ExperimentalPagerApi
import com.google.accompanist.pager.HorizontalPager
import com.google.accompanist.pager.PagerState
import com.google.accompanist.pager.rememberPagerState
import com.malayspeak.app.R
import com.malayspeak.app.data.local.entity.VocabularyCard
import com.malayspeak.app.presentation.common.theme.MalaySpeakTheme
import com.malayspeak.app.presentation.common.theme.MalaySpeakSurface
import kotlinx.coroutines.launch

@OptIn(ExperimentalPagerApi::class)
@Composable
fun VocabularyScreen(
    viewModel: VocabularyViewModel = androidx.hilt.navigation.compose.hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val pagerState = rememberPagerState(pageCount = uiState.cards.size)
    val scope = rememberCoroutineScope()
    
    MalaySpeakTheme {
        MalaySpeakSurface(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header
                Text(
                    text = stringResource(R.string.vocabulary_tab),
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = MalaySpeakTheme.colorScheme.onSurface,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
                
                // Swipe hint
                if (uiState.cards.isNotEmpty()) {
                    Text(
                        text = stringResource(R.string.vocabulary_swipe_hint),
                        fontSize = 12.sp,
                        color = MalaySpeakTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)
                    )
                }
                
                // Pager
                if (uiState.cards.isNotEmpty()) {
                    HorizontalPager(
                        state = pagerState,
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp)
                            .weight(1f)
                    ) { page ->
                        val card = uiState.cards[page]
                        VocabularyCardView(
                            card = card,
                            onLearnedClick = { isLearned ->
                                viewModel.onCardLearnedChanged(card, isLearned)
                            }
                        )
                    }
                } else {
                    // Empty state
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .weight(1f),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            verticalArrangement = Arrangement.spacedBy(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "📚",
                                fontSize = 64.sp
                            )
                            Text(
                                text = stringResource(R.string.vocabulary_empty),
                                fontSize = 18.sp,
                                color = MalaySpeakTheme.colorScheme.onSurfaceVariant,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
                
                // Page indicator
                if (uiState.cards.size > 1) {
                    com.google.accompanist.pager.HorizontalPagerIndicator(
                        pagerState = pagerState,
                        modifier = Modifier.padding(16.dp),
                        selectedColor = MalaySpeakTheme.colorScheme.primary,
                        unselectedColor = MalaySpeakTheme.colorScheme.outlineVariant
                    )
                }
                
                // Learned button (outside pager for easy access)
                if (uiState.cards.isNotEmpty()) {
                    val currentCard = uiState.cards.getOrNull(pagerState.currentPage)
                    currentCard?.let { card ->
                        LearnedActionButton(
                            isLearned = card.isLearned,
                            onClick = { viewModel.onCardLearnedChanged(card, !card.isLearned) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun VocabularyCardView(
    card: VocabularyCard,
    onLearnedClick: (Boolean) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxSize(),
        colors = CardDefaults.cardColors(
            containerColor = if (card.isLearned) 
                MalaySpeakTheme.colorScheme.primaryContainer.copy(alpha = 0.3f) 
            else 
                MalaySpeakTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Malay Phrase (primary)
            Text(
                text = card.malayPhrase,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = if (card.isLearned) 
                    MalaySpeakTheme.colorScheme.primary 
                else 
                    MalaySpeakTheme.colorScheme.onSurface,
                textAlign = TextAlign.Center,
                maxLines = 2,
                overflow = androidx.compose.ui.text.TextOverflow.Ellipsis
            )
            
            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(8.dp))
            
            // Divider
            androidx.compose.foundation.layout.Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(1.dp)
                    .background(MalaySpeakTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
            )
            
            // English Meaning
            TranslationLine(
                label = "English",
                text = card.englishMeaning,
                flag = "🇬🇧"
            )
            
            // Myanmar Meaning
            TranslationLine(
                label = "မြန်မာ",
                text = card.myanmarMeaning,
                flag = "🇲🇲"
            )
            
            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(16.dp))
            
            // Learned indicator
            if (card.isLearned) {
                Text(
                    text = stringResource(R.string.vocabulary_already_learned),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = MalaySpeakTheme.colorScheme.primary
                )
            }
        }
    }
}

@Composable
private fun TranslationLine(label: String, text: String, flag: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = flag, fontSize = 20.sp)
        Column {
            Text(
                text = label,
                fontSize = 12.sp,
                color = MalaySpeakTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = text,
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium,
                color = MalaySpeakTheme.colorScheme.onSurface
            )
        }
    }
}

@Composable
private fun LearnedActionButton(isLearned: Boolean, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, bottom = 16.dp)
            .height(56.dp),
        colors = androidx.compose.material3.ButtonDefaults.buttonColors(
            containerColor = if (isLearned) 
                MalaySpeakTheme.colorScheme.surfaceContainerHighest 
            else 
                MalaySpeakTheme.colorScheme.primary,
            contentColor = if (isLearned) 
                MalaySpeakTheme.colorScheme.onSurfaceVariant 
            else 
                MalaySpeakTheme.colorScheme.onPrimary
        )
    ) {
        Text(
            text = if (isLearned) "✓ ဠလေ့လာပြီးသား" else "✓ ဠလေ့လာမြင့်မားအောင်",
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}