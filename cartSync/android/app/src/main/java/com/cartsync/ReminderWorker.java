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
import java.util.Calendar;

public class ReminderWorker extends Worker {
    
    private static final String PREFS_NAME = "RNAsyncStorageLocalStorage";
    private static final String LAST_UPDATE_KEY = "lastLocationUpdate";
    private static final String LAST_NOTIFICATION_KEY = "lastReminderNotification";
    private static final long FIVE_MINUTES = 5 * 60 * 1000;
    private static final long FORTY_MINUTES = 40 * 60 * 1000;
    private static final String CHANNEL_ID = "cartsync-reminders";
    private static final int NOTIFICATION_ID = 1001;
    
    // Working hours: 7 AM to 5 PM
    private static final int WORK_START_HOUR = 7;
    private static final int WORK_END_HOUR = 17;
    
    public ReminderWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }
    
    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();
        
        try {
            // Check if we're in working hours (7 AM - 5 PM)
            if (!isWorkingHours()) {
                return Result.success(); // Skip notification outside working hours
            }
            
            // Check if tracking is active by checking last update time
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String lastUpdateStr = prefs.getString(LAST_UPDATE_KEY, null);
            String lastNotificationStr = prefs.getString(LAST_NOTIFICATION_KEY, null);
            
            long now = System.currentTimeMillis();
            boolean shouldNotify = false;
            
            // Check if we've sent a notification in the last 40 minutes
            if (lastNotificationStr != null) {
                try {
                    long lastNotification = Long.parseLong(lastNotificationStr);
                    long timeSinceNotification = now - lastNotification;
                    
                    if (timeSinceNotification < FORTY_MINUTES) {
                        // Don't spam - wait at least 40 minutes between notifications
                        return Result.success();
                    }
                } catch (NumberFormatException e) {
                    // Continue if parsing fails
                }
            }
            
            if (lastUpdateStr == null) {
                // No tracking history
                shouldNotify = true;
            } else {
                try {
                    long lastUpdate = Long.parseLong(lastUpdateStr);
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
                // Save notification time
                SharedPreferences.Editor editor = prefs.edit();
                editor.putString(LAST_NOTIFICATION_KEY, String.valueOf(now));
                editor.apply();
            }
            
            return Result.success();
        } catch (Exception e) {
            e.printStackTrace();
            return Result.failure();
        }
    }
    
    /**
     * Check if current time is within working hours (7 AM - 5 PM)
     */
    private boolean isWorkingHours() {
        Calendar calendar = Calendar.getInstance();
        int hour = calendar.get(Calendar.HOUR_OF_DAY);
        return hour >= WORK_START_HOUR && hour < WORK_END_HOUR;
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
