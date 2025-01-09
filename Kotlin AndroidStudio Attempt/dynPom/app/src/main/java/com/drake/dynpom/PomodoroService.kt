package com.drake.dynpom

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat

class PomodoroService : Service() {

    companion object {
        const val CHANNEL_ID = "PomodoroServiceChannel"
        const val TAG = "PomodoroService"
    }

    private val heartbeatInterval = 60 * 1000 // 1 minute
    private val logInterval = 5 * 60 * 1000 // 5 minutes
    private val handler = Handler(Looper.getMainLooper())

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        Log.d(TAG, "Service created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = createNotification()
        startForeground(1, notification)
        Log.d(TAG, "Service started")

        // Start heartbeat timer
        handler.postDelayed(object : Runnable {
            override fun run() {
                Log.d(TAG, "Heartbeat")
                // Send broadcast or update shared preference
                handler.postDelayed(this, heartbeatInterval.toLong())
            }
        }, heartbeatInterval.toLong())

        // Start log timer
        handler.postDelayed(object : Runnable {
            override fun run() {
                Log.d(TAG, "Logging every 5 minutes")
                handler.postDelayed(this, logInterval.toLong())
            }
        }, logInterval.toLong())

        // Start timer logic
        startTimer()

        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "Service destroyed")
        handler.removeCallbacksAndMessages(null)
    }

    override fun onBind(intent: Intent?): IBinder? {
        // Return null because this service is not meant to be bound
        return null
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "Pomodoro Service Channel",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(serviceChannel)
        }
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Pomodoro Timer")
            .setContentText("Pomodoro timer is running")
            .setSmallIcon(R.drawable.ic_notification)
            .build()
    }

    private fun startTimer() {
        // Implement your timer logic here
        Log.d(TAG, "Timer started")
        // Example: Log timer updates
        // Log.d(TAG, "Timer updated: $remainingTime")
    }
}