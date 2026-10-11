package com.malayspeak.app.data.local

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.malayspeak.app.data.local.dao.LearningProgressDao
import com.malayspeak.app.data.local.dao.VocabularyCardDao
import com.malayspeak.app.data.local.database.AppDatabase
import com.malayspeak.app.data.local.entity.LearningProgress
import com.malayspeak.app.data.local.entity.VocabularyCard
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class VocabularyDaoTest {
    
    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()
    
    private lateinit var database: AppDatabase
    private lateinit var vocabularyCardDao: VocabularyCardDao
    private lateinit var learningProgressDao: LearningProgressDao
    
    @Before
    fun setup() {
        database = Room.inMemoryDatabaseBuilder(
            ApplicationProvider.getApplicationContext(),
            AppDatabase::class.java
        ).allowMainThreadQueries().build()
        
        vocabularyCardDao = database.vocabularyCardDao()
        learningProgressDao = database.learningProgressDao()
    }
    
    @After
    fun teardown() {
        database.close()
    }
    
    @Test
    fun `insert and retrieve vocabulary cards`() = runBlocking {
        val card1 = VocabularyCard(
            malayPhrase = "Apa khabar?",
            englishMeaning = "How are you?",
            myanmarMeaning = "နေကောင်းလား?"
        )
        val card2 = VocabularyCard(
            malayPhrase = "Terima kasih",
            englishMeaning = "Thank you",
            myanmarMeaning = "ကျေးဇူးတင်ပါတယ်"
        )
        
        vocabularyCardDao.insertAll(listOf(card1, card2))
        
        val cards = vocabularyCardDao.getAllCardsSync()
        
        assertEquals(2, cards.size)
        assertEquals("Apa khabar?", cards[0].malayPhrase)
        assertEquals("Terima kasih", cards[1].malayPhrase)
    }
    
    @Test
    fun `mark card as learned updates correctly`() = runBlocking {
        val card = VocabularyCard(
            malayPhrase = "Test phrase",
            englishMeaning = "Test meaning",
            myanmarMeaning = "အမေးအမြင့်"
        )
        
        val id = vocabularyCardDao.insert(card)
        assertTrue(id > 0)
        
        val insertedCard = vocabularyCardDao.getCardById(id)
        assertNotNull(insertedCard)
        assertFalse(insertedCard!!.isLearned)
        
        val learnedCard = insertedCard.markAsLearned()
        vocabularyCardDao.update(learnedCard)
        
        val updatedCard = vocabularyCardDao.getCardById(id)
        assertNotNull(updatedCard)
        assertTrue(updatedCard!!.isLearned)
        assertNotNull(updatedCard.learnedAt)
    }
    
    @Test
    fun `get learned and unlearned cards separately`() = runBlocking {
        val card1 = VocabularyCard(
            malayPhrase = "Learned phrase",
            englishMeaning = "Learned",
            myanmarMeaning = "လေ့လာပြီး",
            isLearned = true
        )
        val card2 = VocabularyCard(
            malayPhrase = "Unlearned phrase",
            englishMeaning = "Not learned",
            myanmarMeaning = "မလေ့လာဘူး",
            isLearned = false
        )
        
        vocabularyCardDao.insertAll(listOf(card1, card2))
        
        val allCards = vocabularyCardDao.getAllCardsSync()
        val learnedCards = vocabularyCardDao.getLearnedCardsSync()
        val unlearnedCards = vocabularyCardDao.getUnlearnedCardsSync()
        
        assertEquals(2, allCards.size)
        assertEquals(1, learnedCards.size)
        assertEquals(1, unlearnedCards.size)
        assertEquals("Learned phrase", learnedCards[0].malayPhrase)
        assertEquals("Unlearned phrase", unlearnedCards[0].malayPhrase)
    }
    
    @Test
    fun `learning progress calculates percentage correctly`() = runBlocking {
        val progress = LearningProgress(id = 1, totalCards = 10, learnedCards = 3)
        
        assertEquals(30f, progress.progressPercentage, 0.01f)
        
        val updatedProgress = progress.updateCounts(20, 10)
        assertEquals(50f, updatedProgress.progressPercentage, 0.01f)
    }
}