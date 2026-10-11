package com.malayspeak.app.presentation.common.util

import android.content.Context
import android.content.ClipData
import android.content.ClipboardManager
import android.widget.Toast
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import com.malayspeak.app.R

fun String.copyToClipboard(context: Context, label: String) {
    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    val clip = ClipData.newPlainText(label, this)
    clipboard.primaryClip = clip
    Toast.makeText(context, "${context.getString(R.string.translate_copied)}: $label", Toast.LENGTH_SHORT).show()
}

@Composable
fun provideClipboardAction(): (String, String) -> Unit {
    val context = LocalContext.current
    return { text, label -> text.copyToClipboard(context, label) }
}