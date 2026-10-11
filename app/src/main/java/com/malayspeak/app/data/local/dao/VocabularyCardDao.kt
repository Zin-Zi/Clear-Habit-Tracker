package com.malayspeak.app.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.malayspeak.app.data.local.entity.VocabularyCard
import kotlinx.coroutines.flow.Flow

@Dao
interface VocabularyCardDao {
    
    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertAll(cards: List<VocabularyCard>): List<Long>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(card: VocabularyCard): Long
    
    @Update
    suspend fun update(card: VocabularyCard): Int
    
    @Query("SELECT * FROM vocabulary_cards ORDER BY createdAt ASC")
    fun getAllCards(): Flow<List<VocabularyCard>>
    
    @Query("SELECT * FROM vocabulary_cards ORDER BY createdAt ASC")
    suspend fun getAllCardsSync(): List<VocabularyCard>
    
    @Query("SELECT * FROM vocabulary_cards WHERE isLearned = 1 ORDER BY learnedAt DESC")
    fun getLearnedCards(): Flow<List<VocabularyCard>>
    
    @Query("SELECT * FROM vocabulary_cards WHERE isLearned = 0 ORDER BY createdAt ASC")
    fun getUnlearnedCards(): Flow<List<VocabularyCard>>
    
    @Query("SELECT COUNT(*) FROM vocabulary_cards")
    fun getTotalCount(): Flow<Int>
    
    @Query("SELECT COUNT(*) FROM vocabulary_cards WHERE isLearned = 1")
    fun getLearnedCount(): Flow<Int>
    
    @Query("SELECT * FROM vocabulary_cards WHERE id = :id")
    suspend fun getCardById(id: Long): VocabularyCard?
    
    @Query("DELETE FROM vocabulary_cards")
    suspend fun deleteAll(): Int
    
    // Search functionality for offline translation
    @Query("SELECT * FROM vocabulary_cards WHERE malayPhrase LIKE '%' || :query || '%' OR englishMeaning LIKE '%' || :query || '%' OR myanmarMeaning LIKE '%' || :query || '%' ORDER BY createdAt ASC LIMIT 20")
    fun searchCards(query: String): Flow<List<VocabularyCard>>
    
    @Query("SELECT * FROM vocabulary_cards WHERE malayPhrase LIKE '%' || :query || '%' OR englishMeaning LIKE '%' || :query || '%' OR myanmarMeaning LIKE '%' || :query || '%' ORDER BY createdAt ASC LIMIT 20")
    suspend fun searchCardsSync(query: String): List<VocabularyCard>
    
    // Random card for daily learning
    @Query("SELECT * FROM vocabulary_cards ORDER BY RANDOM() LIMIT 1")
    suspend fun getRandomCard(): VocabularyCard?
}