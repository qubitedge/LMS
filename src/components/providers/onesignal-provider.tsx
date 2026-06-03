'use client';

import { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';

export function OneSignalProvider() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;

    const initializeOneSignal = async () => {
      try {
        await OneSignal.init({
          appId: '2ed873bf-9663-4f4f-96dd-598ec2f39cd2',
          safari_web_id: 'web.onesignal.auto.32d5e245-163c-40cb-8f57-67057af17423',
          allowLocalhostAsSecureOrigin: true,
          notifyButton: {
            enable: true,
          },
        });
        setInitialized(true);
      } catch (error) {
        console.error('Error initializing OneSignal:', error);
      }
    };

    initializeOneSignal();
  }, [initialized]);

  return null;
}
