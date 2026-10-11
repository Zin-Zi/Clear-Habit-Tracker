package com.malayspeak.app.util

object Constants {
    // Gemini API
    const val GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/"
    const val GEMINI_MODEL = "gemini-1.5-flash"
    
    // Translation Prompt
    const val TRANSLATION_PROMPT = """
        You are a Malaysian Malay language tutor for Burmese speakers. 
        Translate the user's input (English or Malay) into THREE languages: Myanmar (Burmese), English, and Malaysian Malay (colloquial, NOT formal, NOT Indonesian).
        
        Requirements:
        1. Focus on CONVERSATIONAL/COLLOQUIAL Malaysian Malay (Manglish/Street Malay) - how people actually speak in Malaysia
        2. Provide a SHORT explanation of WHY it's translated that way (grammar, colloquialisms, cultural context)
        3. Return ONLY valid JSON - no markdown, no extra text
        
        Output JSON structure:
        {
          "myanmar": "မြန်မာဘာသာဖြင့် အရင်းအမြစ်",
          "english": "English translation",
          "malay": "Colloquial Malaysian Malay translation",
          "explanation": "Short explanation in English of why this translation (focus on colloquial usage, particles like lah/lor/meh, dropped words, etc.)"
        }
        
        Examples:
        Input: "How much is this?"
        Output: {
          "myanmar": "ဒါဘယ်လောက်လဲ",
          "english": "How much is this?",
          "malay": "Ni berapa?",
          "explanation": "In colloquial Malaysian Malay, 'ini' becomes 'ni', and 'berapa harganya' shortens to just 'berapa'. No formal 'harganya' needed."
        }
        
        Input: "Saya nak makan"
        Output: {
          "myanmar": "ကျွန်တော် စားချင်တယ်",
          "english": "I want to eat",
          "malay": "Aku nak makan",
          "explanation": "'Saya' (formal I) becomes 'aku' (casual I). 'Nak' is colloquial for 'hendak/mahu' (want). This is natural spoken Malaysian Malay."
        }
    """.trimIndent()
    
    // Vocabulary seed data (phrase-focused)
    const val SEED_VOCABULARY_JSON = """
        [
          {"malay": "Apa khabar?", "english": "How are you?", "myanmar": "နေကောင်းလား?"},
          {"malay": "Nama saya...", "english": "My name is...", "myanmar": "ကျွန်တော်၏ အမည်က..."},
          {"malay": "Terima kasih", "english": "Thank you", "myanmar": "ကျေးဇူးတင်ပါတယ်"},
          {"malay": "Sama-sama", "english": "You're welcome", "myanmar": "ရပါတယ်"},
          {"malay": "Maaf", "english": "Sorry/Excuse me", "myanmar": "မောင်းပါပါ"},
          {"malay": "Berapa harganya?", "english": "How much is it?", "myanmar": "ဘယ်လောက်လဲ?"},
          {"malay": "Ni berapa?", "english": "How much is this? (colloquial)", "myanmar": "ဒါဘယ်လောက်လဲ?"},
          {"malay": "Boleh kurang?", "english": "Can you lower the price?", "myanmar": "နှုတ်ပေးလို့ရလား?"},
          {"malay": "Saya nak beli ni", "english": "I want to buy this", "myanmar": "ကျွန်တော် ဒါ�ówno ခုန်ချင်တယ်"},
          {"malay": "Makan sini ke tapau?", "english": "Eat here or takeaway?", "myanmar": "இங்கே சாப்பிடலாமா அலிவே இல்லை தாபாவு?"},
          {"malay": "Tapau saja", "english": "Takeaway only", "myanmar": "தாபாவு மாத்திரம்"},
          {"malay": "Air kosong", "english": "Plain water", "myanmar": "ရေချော"},
          {"malay": "Teh ais", "english": "Iced tea", "myanmar": "ရေဖိတ်ရေခဲ"},
          {"malay": "Kopi O", "english": "Black coffee", "myanmar": "ကော်ဖီး အဓက်တ monastère"},
          {"malay": "Roti canai", "english": "Roti canai (flatbread)", "myanmar": "ရောတီ ခနိုင်"},
          {"malay": "Nasi lemak", "english": "Nasi lemak (coconut rice)", "myanmar": "နာစီ လဲမောက်"},
          {"malay": "Jom makan", "english": "Let's eat", "myanmar": "စားဖို့ไปစို့"},
          {"malay": "Tunggu sebentar", "english": "Wait a moment", "myanmar": "တစ်ချိန်အနေနဲ့ စောင့်ပါ"},
          {"malay": "Tak apa", "english": "It's okay/No problem", "myanmar": "မဟုတ်ပါဘူး/ရပါတယ်"},
          {"malay": "Boleh lah", "english": "Can do/Okay", "myanmar": "လုပ်လို့ရပါတယ်"},
          {"malay": "Confirm tak?", "english": "Are you sure?", "myanmar": "ဖာယ်နေတတ်လား?"},
          {"malay": "Steady lah", "english": "Cool/No worries", "myanmar": "အဆင်ပြေပါတယ်/ခက်ခဲမလုပ်ပါ"},
          {"malay": "Where got?", "english": "No way/Impossible", "myanmar": "မရှိပါ/မဟုတ်ပါဘူး"},
          {"malay": "Die die must try", "english": "You absolutely must try", "myanmar": "ဖစ်မှတ်စရာ စूब pihakတည်"},
          {"malay": "Alamak!", "english": "Oh no!/Oops!", "myanmar": "အားလားမက်!"},
          {"malay": "Shiok!", "english": "Awesome/Delicious!", "myanmar": "ကောင်းပ 더군요!"},
          {"malay": "Buay tahan", "english": "Can't stand it/Unbearable", "myanmar": "อด incapaz"},
          {"malay": "Lepak", "english": "Hang out/Chill", "myanmar": "စက်ရင်စေ့အချိန်တွင်လှူတိုင်း ဂျော့"},
          {"malay": "Makan angin", "english": "Go out for a break/fresh air", "myanmar": "န Nga ခရီးစဉ် အနေနဲ့ ထွက်ရပ်လျှင်"},
          {"malay": "On the way", "english": "On the way (commonly used)", "myanmar": "လမ်းပေါ်ရှိနေပါတယ်"},
          {"malay": "Reach already", "english": "I've arrived", "myanmar": "ရောက်ရှိပြီးပါပြီ"},
          {"malay": "Later lah", "english": "I'll do it later", "myanmar": "နောက်မှာ လုပ်မယ်"}
        ]
    """.trimIndent()
    
    // Database
    const val DATABASE_NAME = "malayspeak_db"
    
    // Preferences
    const val PREFS_NAME = "malayspeak_prefs"
    const val KEY_ONBOARDING_COMPLETE = "onboarding_complete"
    const val KEY_FIRST_RUN = "first_run"
    
    // Pagination
    const val VOCABULARY_PAGE_SIZE = 20
}