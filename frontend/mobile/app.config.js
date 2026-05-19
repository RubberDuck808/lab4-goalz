module.exports = {
  expo: {
    name: 'Loggin',
    slug: 'loggin',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon_white.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.goalz.loggin',
      infoPlist: {
        NSCameraUsageDescription: 'Loggin uses your camera to photograph plants and elements in the arboretum.',
        NSPhotoLibraryUsageDescription: 'Loggin saves photos of arboretum elements to your photo library.',
        NSBluetoothAlwaysUsageDescription: 'Loggin needs Bluetooth to detect nearby checkpoints.',
        NSBluetoothPeripheralUsageDescription: 'Loggin needs Bluetooth to detect nearby checkpoints.',
        ITSAppUsesNonExemptEncryption: false,
        NSAppTransportSecurity: {
          NSExceptionDomains: {
            localhost: {
              NSIncludesSubdomains: false,
              NSTemporaryExceptionAllowsInsecureHTTPLoads: true,
            },
          },
        },
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      permissions: [
        'android.permission.CAMERA',
        'android.permission.BLUETOOTH',
        'android.permission.BLUETOOTH_ADMIN',
        'android.permission.BLUETOOTH_SCAN',
        'android.permission.BLUETOOTH_CONNECT',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
      ],
      package: 'com.goalz.loggin',
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
        },
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    updates: {
      url: 'https://u.expo.dev/56f66eca-5087-48dc-af70-ff32e2274a80',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    plugins: [
      'expo-secure-store',
      'expo-location',
      [
        'expo-camera',
        {
          cameraPermission: 'Loggin uses your camera to photograph plants and elements in the arboretum.',
        },
      ],
      [
        'expo-image-picker',
        {
          cameraPermission: 'Loggin uses your camera to photograph plants and elements in the arboretum.',
          photosPermission: 'Loggin saves photos of arboretum elements to your photo library.',
        },
      ],
    ],
    extra: {
      eas: {
        projectId: '56f66eca-5087-48dc-af70-ff32e2274a80',
      },
    },
    owner: 'goalz',
  },
};
