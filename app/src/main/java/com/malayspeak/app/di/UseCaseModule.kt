package com.malayspeak.app.di

import com.malayspeak.app.domain.usecase.GetProgressUseCase
import com.malayspeak.app.domain.usecase.GetVocabularyCardsUseCase
import com.malayspeak.app.domain.usecase.MarkCardLearnedUseCase
import com.malayspeak.app.domain.usecase.TranslateTextUseCase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object UseCaseModule {
    
    @Provides
    @Singleton
    fun provideTranslateTextUseCase(useCase: TranslateTextUseCase) = useCase
    
    @Provides
    @Singleton
    fun provideGetVocabularyCardsUseCase(useCase: GetVocabularyCardsUseCase) = useCase
    
    @Provides
    @Singleton
    fun provideMarkCardLearnedUseCase(useCase: MarkCardLearnedUseCase) = useCase
    
    @Provides
    @Singleton
    fun provideGetProgressUseCase(useCase: GetProgressUseCase) = useCase
}