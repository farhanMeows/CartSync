package com.cartsync;

import android.content.Context;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import java.util.concurrent.TimeUnit;

public class ReminderModule extends ReactContextBaseJavaModule {
    
    private static final String MODULE_NAME = "ReminderModule";
    private static final String WORK_NAME = "LocationReminderWork";
    
    public ReminderModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }
    
    @Override
    public String getName() {
        return MODULE_NAME;
    }
    
    @ReactMethod
    public void scheduleReminder(int intervalMinutes, Promise promise) {
        try {
            Context context = getReactApplicationContext();
            
            // Create periodic work request
            PeriodicWorkRequest reminderWork = new PeriodicWorkRequest.Builder(
                ReminderWorker.class,
                intervalMinutes,
                TimeUnit.MINUTES
            ).build();
            
            // Schedule the work (replace existing if any)
            WorkManager.getInstance(context)
                .enqueueUniquePeriodicWork(
                    WORK_NAME,
                    ExistingPeriodicWorkPolicy.REPLACE,
                    reminderWork
                );
            
            promise.resolve("Reminder scheduled every " + intervalMinutes + " minutes");
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to schedule reminder: " + e.getMessage());
        }
    }
    
    @ReactMethod
    public void cancelReminder(Promise promise) {
        try {
            Context context = getReactApplicationContext();
            WorkManager.getInstance(context).cancelUniqueWork(WORK_NAME);
            promise.resolve("Reminder cancelled");
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to cancel reminder: " + e.getMessage());
        }
    }
}
