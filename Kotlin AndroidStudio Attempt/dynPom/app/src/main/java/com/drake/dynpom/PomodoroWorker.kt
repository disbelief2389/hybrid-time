package com.drake.dynpom

import android.content.Context
import android.util.Log
import androidx.work.Worker
import androidx.work.WorkerParameters

class PomodoroWorker(context: Context, workerParams: WorkerParameters) : Worker(context, workerParams) {
    override fun doWork(): Result {
        Log.d("PomodoroWorker", "Work is being executed")
        // Implement your timer logic here
        return Result.success()
    }
}