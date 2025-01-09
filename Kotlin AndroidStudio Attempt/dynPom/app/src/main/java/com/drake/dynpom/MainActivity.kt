package com.drake.dynpom

import android.content.Intent
import android.media.AudioAttributes
import android.media.SoundPool
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.drake.dynpom.ui.theme.DynPomTheme
import kotlinx.coroutines.delay
import java.util.Locale
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            DynPomTheme {
                PomodoroApp()
            }
        }

        // Start the PomodoroService as a foreground service
        val serviceIntent = Intent(this, PomodoroService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }

        // Schedule the PomodoroWorker to run periodically
        val workRequest = PeriodicWorkRequestBuilder<PomodoroWorker>(15, TimeUnit.MINUTES)
            .build()
        WorkManager.getInstance(this).enqueue(workRequest)
    }
}

@Composable
fun PomodoroApp() {
    val context = LocalContext.current
    var isWorking by remember { mutableStateOf(false) }
    var breakTime by remember { mutableLongStateOf(0L) }
    var isPaused by remember { mutableStateOf(true) }
    var resumeMode by remember { mutableStateOf("Manual Resume") }

    val soundPool = remember {
        SoundPool.Builder()
            .setAudioAttributes(AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_GAME)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build())
            .setMaxStreams(1)
            .build()
    }

    var bellSoundId by remember { mutableIntStateOf(0) }

    LaunchedEffect(soundPool, context) {
        bellSoundId = soundPool.load(context, R.raw.singingbowl, 1)
    }

    DisposableEffect(soundPool) {
        onDispose {
            soundPool.release()
        }
    }

    var currentTime by remember { mutableLongStateOf(0L) }

    LaunchedEffect(isWorking, isPaused, currentTime, breakTime) {
        if (isWorking && !isPaused) {
            while (isWorking && !isPaused) {
                delay(1000)
                currentTime += 1000
            }
        } else if (!isWorking && !isPaused && breakTime > 0) {
            while (true) {
                delay(1000)
                breakTime -= 1000
                if (breakTime <= 0) {
                    breakTime = 0 // Ensure breakTime doesn't go below 0
                    // Play the bell sound
                    if (bellSoundId != 0) {
                        soundPool.play(bellSoundId, 1f, 1f, 0, 0, 1f)
                    }
                    if (resumeMode == "Automatic Resume") {
                        isWorking = true // Automatically switch to work mode
                        currentTime = 0L // Reset work timer
                    }
                    break // Exit the loop
                }
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "dynamicPomodoro",
            fontSize = 24.sp,
            color = Color.White
        )

        Text(
            text = if (isWorking) formatTime(currentTime) else formatTime(breakTime),
            fontSize = 48.sp,
            color = Color.White
        )

        Spacer(modifier = Modifier.height(32.dp))

        if (isWorking) {
            StyledButton(text = "Take Break", onClick = {
                isWorking = false
                isPaused = false
                breakTime = currentTime
                currentTime = 0L
            })
        } else {
            StyledButton(text = "Start Work", onClick = {
                isWorking = true
                isPaused = false
                currentTime = 0L
            })
        }

        Spacer(modifier = Modifier.height(16.dp))

        StyledButton(text = if (isPaused) "Resume" else "Pause", onClick = {
            isPaused = !isPaused
        })

        StyledButton(text = "Toggle Mode", onClick = {
            resumeMode = if (resumeMode == "Manual Resume") "Automatic Resume" else "Manual Resume"
        })

        Text(
            text = "Mode: $resumeMode",
            fontSize = 12.sp,
            color = Color.White.copy(alpha = 0.5f)
        )

        StyledButton(text = "Reset", onClick = {
            isWorking = false
            isPaused = true
            currentTime = 0L
            breakTime = 0L
        })
    }
}

@Composable
fun StyledButton(
    text: String,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(
            containerColor = Color(0xFF0B140D),
            contentColor = Color(0xFFFAF0E6)
        ),
        shape = RoundedCornerShape(50),
        modifier = Modifier
            .padding(10.dp)
            .height(60.dp)
            .fillMaxWidth()
    ) {
        Text(
            text = text,
            fontSize = 16.sp
        )
    }
}

fun formatTime(millis: Long): String {
    val seconds = (millis / 1000).toInt()
    val minutes = seconds / 60
    val remainingSeconds = seconds % 60
    return String.format(Locale.US, "%02d:%02d", minutes, remainingSeconds)
}