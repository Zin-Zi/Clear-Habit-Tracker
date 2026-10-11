package com.malayspeak.app.di

import com.malayspeak.app.data.local.repository.VocabularyRepositoryImpl
import com.malayspeak.app.data.remote.repository.TranslationRepositoryImpl
import com.malayspeak.app.domain.repository.TranslationRepository
import com.malayspeak.app.domain.repository.VocabularyRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {
    
    @Provides
    @Singleton
    fun provideVocabularyRepository(impl: VocabularyRepositoryImpl): VocabularyRepository {
        return impl
    }
    
    @Provides
    @Singleton
    fun provideTranslationRepository(impl: TranslationRepositoryImpl): TranslationRepository {
        return impl
    }
}