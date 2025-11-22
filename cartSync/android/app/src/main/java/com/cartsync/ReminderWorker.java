package com.cartsync;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

public class ReminderWorker extends Worker {
    
    private static final String PREFS_NAME = "RNAsyncStorageLocalStorage";
    private static final String LAST_UPDATE_KEY = "lastLocationUpdate";
    private static final long FIVE_MINUTES = 5 * 60 * 1000;
    private static final String CHANNEL_ID = "cartsync-reminders";
    private static final int NOTIFICATION_ID = 1001;
    
    public ReminderWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }
    
    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();
        
        try {
            // Check if tracking is active by checking last update time
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String lastUpdateStr = prefs.getString(LAST_UPDATE_KEY, null);
            
            boolean shouldNotify = false;
            
            if (lastUpdateStr == null) {
                // No tracking history
                shouldNotify = true;
            } else {
                try {
                    long lastUpdate = Long.parseLong(lastUpdateStr);
                    long now = System.currentTimeMillis();
                    long timeSinceUpdate = now - lastUpdate;
                    
                    // If more than 5 minutes since last update, send reminder
                    if (timeSinceUpdate > FIVE_MINUTES) {
                        shouldNotify = true;
                    }
                } catch (NumberFormatException e) {
                    shouldNotify = true;
                }
            }
            
            if (shouldNotify) {
                showNotification(context);
            }
            
            return Result.success();
        } catch (Exception e) {
            e.printStackTrace();
            return Result.failure();
        }
    }
    
    private void showNotification(Context context) {
        try {
            NotificationManager notificationManager = 
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            
            // Create notification channel (Android 8.0+)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "CartSync Reminders",
                    NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription("Location tracking reminder notifications");
                channel.enableVibration(true);
                channel.setVibrationPattern(new long[]{300, 500});
                notificationManager.createNotificationChannel(channel);
            }
            
            // Create intent to open app when notification is tapped
            Intent intent = new Intent(context, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                context, 
                0, 
                intent, 
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            
            // Build notification
            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle("📍 Start Location Sharing")
                .setContentText("You are not sharing your location. Please open CartSync and start tracking.")
                .setStyle(new NotificationCompat.BigTextStyle()
                    .bigText("You are not sharing your location. Please open CartSync and start tracking."))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .setVibrate(new long[]{300, 500})
                .setContentIntent(pendingIntent)
                .setColor(0xFFF39C12); // Orange color
            
            notificationManager.notify(NOTIFICATION_ID, builder.build());
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
