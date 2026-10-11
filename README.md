# မလေးစကားပြော (MalaySpeak)

A Malay language learning app for Burmese speakers. Learn conversational Malaysian Malay through translation and vocabulary cards.

## Features

### 1. Translation (English ↔ Malay)
- Input text in English or Malay
- Get translations in 3 languages: Myanmar, English, and Malaysian Malay (colloquial)
- Explanation of WHY it's translated that way (focus on colloquial usage)
- Powered by Google Gemini API

### 2. Vocabulary Cards
- Swipeable card interface (one card per screen)
- Each card shows: Malay phrase, English meaning, Myanmar meaning
- Focus on PHRASES, not single words
- Mark cards as "learned" to track progress

### 3. Progress Tracking
- Visual progress bar showing percentage learned
- Statistics: total cards, learned cards, remaining
- Data stored locally using Room database
- No login, no cloud sync required

## Tech Stack

- **Language**: Kotlin
- **UI**: Jetpack Compose (Material 3)
- **Architecture**: MVVM (Model-View-ViewModel)
- **Local DB**: Room
- **Network**: Retrofit + OkHttp
- **Async**: Coroutines + Flow
- **Dependency Injection**: Hilt
- **LLM Provider**: Google Gemini API
- **Min SDK**: API 26 (Android 8.0)

## Setup

### Prerequisites
- Android Studio Koala or later
- JDK 17
- Google Gemini API key

### Configuration

1. Clone the repository
2. Create `local.properties` in the project root (copy from `local.properties.example`)
3. Add your Gemini API key:
   ```properties
   GEMINI_API_KEY=your_api_key_here
   ```
4. Build and run the app

### Getting a Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Copy the key to `local.properties`

## Project Structure

```
com.malayspeak.app
├── data
│   ├── local          # Room database, DAOs, entities
│   ├── remote         # Retrofit API, DTOs
│   └── repository     # Repository implementations
├── domain
│   ├── model          # Domain models
│   ├── repository     # Repository interfaces
│   └── usecase        # Business logic use cases
├── presentation
│   ├── common         # Shared components, theme
│   ├── main           # Main activity, navigation
│   ├── onboarding     # First-run onboarding
│   ├── translate      # Translation screen
│   ├── vocabulary     # Vocabulary cards screen
│   └── progress       # Progress tracking screen
├── di                 # Hilt modules
└── util               # Utilities, constants
```

## Security

- **API Key**: Never hardcoded. Read from `local.properties` via `BuildConfig`
- **No user data collection**: All data stored locally on device
- **No analytics/tracking**: Privacy-first approach

## Testing

Run unit tests:
```bash
./gradlew test
```

Run instrumented tests:
```bash
./gradlew connectedAndroidTest
```

## Architecture Decisions

### Why MVVM + Clean Architecture?
- Separation of concerns
- Testability
- Maintainability
- Single responsibility principle

### Why Room + Flow?
- Reactive UI updates
- Type-safe queries
- Compile-time SQL verification
- Coroutines integration

### Why Gemini API?
- High-quality translations for low-resource languages
- Structured JSON output support
- Good understanding of colloquial Malaysian Malay

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Support

For issues and feature requests, please use the GitHub issue tracker.