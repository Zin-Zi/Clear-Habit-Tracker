package com.malayspeak.app.data.local.repository

import android.content.Context
import com.malayspeak.app.data.local.dao.VocabularyCardDao
import com.malayspeak.app.data.local.entity.VocabularyCard
import com.malayspeak.app.util.Constants
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class VocabularyInitializer @Inject constructor(
    private val vocabularyCardDao: VocabularyCardDao,
    private val context: Context
) {
    
    fun initializeIfNeeded() {
        CoroutineScope(Dispatchers.IO).launch {
            val count = vocabularyCardDao.getTotalCountSync()
            if (count == 0) {
                seedVocabulary()
            }
        }
    }
    
    private suspend fun seedVocabulary() {
        val json = Json { ignoreUnknownKeys = true }
        val vocabularyList = json.decodeFromString<List<VocabularyDto>>(Constants.SEED_VOCABULARY_JSON)
        
        val cards = vocabularyList.map { dto ->
            VocabularyCard(
                malayPhrase = dto.malay,
                englishMeaning = dto.english,
                myanmarMeaning = dto.myanmar,
                isLearned = false
            )
        }
        
        vocabularyCardDao.insertAll(cards)
    }
    
    // Sync helper
    private suspend fun VocabularyCardDao.getTotalCountSync(): Int {
        return getAllCardsSync().size
    }
}