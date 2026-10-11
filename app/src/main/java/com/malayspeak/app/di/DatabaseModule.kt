package com.malayspeak.app.di

import android.content.Context
import com.malayspeak.app.data.local.database.AppDatabase
import com.malayspeak.app.data.local.dao.LearningProgressDao
import com.malayspeak.app.data.local.dao.VocabularyCardDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    
    @Provides
    @Singleton
    fun provideDatabase(@dagger.hilt.android.qualifiers.ApplicationContext context: Context): AppDatabase {
        return AppDatabase.getInstance(context)
    }
    
    @Provides
    fun provideVocabularyCardDao(database: AppDatabase): VocabularyCardDao {
        return database.vocabularyCardDao()
    }
    
    @Provides
    fun provideLearningProgressDao(database: AppDatabase): LearningProgressDao {
        return database.learningProgressDao()
    }
}