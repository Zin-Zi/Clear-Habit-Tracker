package com.malayspeak.app.util

sealed interface Result<out T> {
    data class Success<out T>(val data: T) : Result<T>
    data class Failure(val exception: Throwable, val message: String? = null) : Result<Nothing>
    
    companion object {
        fun <T> success(data: T): Result<T> = Success(data)
        fun <T> failure(exception: Throwable, message: String? = null): Result<T> = Failure(exception, message)
    }
    
    fun isSuccess(): Boolean = this is Success<*>
    fun isFailure(): Boolean = this is Failure
    
    fun getOrNull(): T? = when (this) {
        is Success -> data
        is Failure -> null
    }
    
    fun getOrThrow(): T = when (this) {
        is Success -> data
        is Failure -> throw exception
    }
    
    fun <R> map(transform: (T) -> R): Result<R> = when (this) {
        is Success -> Success(transform(data))
        is Failure -> this
    }
    
    fun <R> flatMap(transform: (T) -> Result<R>): Result<R> = when (this) {
        is Success -> transform(data)
        is Failure -> this
    }
    
    fun onSuccess(action: (T) -> Unit): Result<T> {
        if (this is Success) action(data)
        return this
    }
    
    fun onFailure(action: (Throwable) -> Unit): Result<T> {
        if (this is Failure) action(exception)
        return this
    }
}