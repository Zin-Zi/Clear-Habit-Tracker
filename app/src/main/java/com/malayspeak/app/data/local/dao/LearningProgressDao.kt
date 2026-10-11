package com.malayspeak.app.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.malayspeak.app.data.local.entity.LearningProgress
import kotlinx.coroutines.flow.Flow

@Dao
interface LearningProgressDao {
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(progress: LearningProgress): Long
    
    @Update
    suspend fun update(progress: LearningProgress): Int
    
    @Query("SELECT * FROM learning_progress WHERE id = 1")
    fun getProgress(): Flow<LearningProgress>
    
    @Query("SELECT * FROM learning_progress WHERE id = 1")
    suspend fun getProgressSync(): LearningProgress?
    
    @Query("DELETE FROM learning_progress")
    suspend fun deleteAll(): Int
}