'use client';

import { useEffect, useRef } from 'react';
import OneSignal from 'react-onesignal';

export function OneSignalProvider() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      console.log('OneSignal initialization skipped in local development');
      return;
    }

    initialized.current = true;

    OneSignal.init({
      appId: '2ed873bf-9663-4f4f-96dd-598ec2f39cd2',
      allowLocalhostAsSecureOrigin: true,
      serviceWorkerPath: '/OneSignalSDKWorker.js',
    }).catch((error) => {
      console.error('Error initializing OneSignal:', error);
    });
  }, []);

  return null;
}
