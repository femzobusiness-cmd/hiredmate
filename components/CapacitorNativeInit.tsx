'use client';

import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { useEffect } from 'react';

/**
 * Initializes native Capacitor plugins when running inside iOS/Android shell.
 * The app loads https://hiredmate.app via capacitor.config server.url.
 */
export function CapacitorNativeInit() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const init = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#7C5CBF' });
      } catch {
        // Status bar plugin may be unavailable on some WebView versions
      }

      try {
        await SplashScreen.hide();
      } catch {
        // Splash already hidden or not configured
      }
    };

    void init();
  }, []);

  return null;
}
