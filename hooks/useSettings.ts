import { useCallback, useEffect, useState } from 'react';

export interface SettingsState {
  autoStartRest: boolean;
  restSound: boolean;
  restVibration: boolean;
}

const DEFAULTS: SettingsState = {
  autoStartRest: true,
  restSound: true,
  restVibration: true,
};

const STORAGE_KEY = 'rebld:settings:v1';

export default function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings({ ...DEFAULTS, ...parsed });
      }
    } catch {}
  }, []);

  const update = useCallback((patch: Partial<SettingsState>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { settings, update };
}

