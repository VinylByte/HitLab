import { useEffect, useRef } from 'react';

export function useWakeLock(active: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const releaseLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch (error) {
        console.error('Failed to release wake lock:', error);
      }
    }
  };

  const requestLock = async () => {
    if (!('wakeLock' in navigator)) {
      return;
    }
    if (!active || document.visibilityState !== 'visible') {
      return;
    }
    try {
      const lock = await navigator.wakeLock.request('screen');
      wakeLockRef.current = lock;
      lock.addEventListener('release', () => {
        wakeLockRef.current = null;
      });
    } catch (error) {
      console.error('Failed to request wake lock:', error);
    }
  };

  useEffect(() => {
    if (active && document.visibilityState === 'visible') {
      requestLock();
    } else {
      releaseLock();
    }

    const handleVisibilityChange = () => {
      if (active && document.visibilityState === 'visible') {
        requestLock();
      } else if (document.visibilityState === 'hidden') {
        releaseLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseLock();
    };
  }, [active]);
}
