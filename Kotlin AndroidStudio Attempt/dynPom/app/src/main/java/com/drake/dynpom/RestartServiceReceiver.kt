package com.drake.dynpom

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class RestartServiceReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        if (action == Intent.ACTION_BOOT_COMPLETED || action == Intent.ACTION_SHUTDOWN) {
            Log.d("RestartServiceReceiver", "Service is being restarted due to action: $action")
            context.startService(Intent(context, PomodoroService::class.java))
        } else {
            Log.w("RestartServiceReceiver", "Received unexpected action: $action")
        }
    }
}