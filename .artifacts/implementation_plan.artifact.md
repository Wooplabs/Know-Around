# Preview App on Android Emulator

The goal is to set up and run the Expo app on an Android emulator within Android Studio.

## User Review Required

> [!IMPORTANT]
> No Android Virtual Devices (AVDs) were detected on your system. You will need to create one in Android Studio before you can preview your app.

## Proposed Steps

### 1. Create and Start an Android Emulator
If you haven't created an emulator yet:
1. Open **Android Studio**.
2. Go to **Tools** > **Device Manager**.
3. Click **Create Device** (or the **+** icon).
4. Select a device definition (e.g., Pixel 7) and click **Next**.
5. Select a system image (e.g., API 34 or higher) and click **Next**.
6. Click **Finish**.
7. In the Device Manager, click the **Play** button next to your new device to start the emulator.

### 2. Run the App
Once the emulator is running, you can start the app by running the following command in your terminal:

```bash
npm run android
```

This command will:
- Start the Expo development server.
- Build the app for Android.
- Install and open the app on your running emulator.

## Verification Plan

### Manual Verification
- Verify that the emulator starts successfully.
- Verify that `npm run android` successfully installs and opens the app on the emulator.
