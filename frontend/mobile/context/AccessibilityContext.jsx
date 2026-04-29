import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const storage = Platform.OS === 'web'
  ? {
      setItemAsync: async (key, val) => { localStorage.setItem(key, val); },
      getItemAsync: async (key) => localStorage.getItem(key) ?? null,
    }
  : SecureStore;

const FONT_SCALE_KEY = 'accessibility_font_scale';
const COLOR_MODE_KEY = 'accessibility_color_mode';

export const FONT_SCALES = [
  { label: 'Default', value: 1.0 },
  { label: 'Large', value: 1.2 },
  { label: 'Extra Large', value: 1.5 },
];

export const COLOR_MODES = [
  { label: 'None', value: 'none' },
  { label: 'High Contrast', value: 'high_contrast' },
];

const AccessibilityContext = createContext({
  fontScale: 1.0,
  colorMode: 'none',
  setFontScale: () => {},
  setColorMode: () => {},
});

export function AccessibilityProvider({ children }) {
  const [fontScale, setFontScaleState] = useState(1.0);
  const [colorMode, setColorModeState] = useState('none');

  useEffect(() => {
    Promise.all([
      storage.getItemAsync(FONT_SCALE_KEY),
      storage.getItemAsync(COLOR_MODE_KEY),
    ]).then(([scale, mode]) => {
      if (scale) setFontScaleState(parseFloat(scale));
      if (mode) setColorModeState(mode);
    });
  }, []);

  async function setFontScale(value) {
    setFontScaleState(value);
    await storage.setItemAsync(FONT_SCALE_KEY, String(value));
  }

  async function setColorMode(value) {
    setColorModeState(value);
    await storage.setItemAsync(COLOR_MODE_KEY, value);
  }

  return (
    <AccessibilityContext.Provider value={{ fontScale, colorMode, setFontScale, setColorMode }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}

export function useColors() {
  const { colorMode } = useContext(AccessibilityContext);
  if (colorMode === 'high_contrast') {
    return {
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      textSecondary: '#cccccc',
      border: '#ffffff',
      accent: '#ffff00',
      accentText: '#000000',
    };
  }
  return {
    background: '#ffffff',
    surface: '#f4f4f5',
    text: '#27272a',
    textSecondary: '#71717a',
    border: '#e4e4e7',
    accent: '#3b82f6',
    accentText: '#ffffff',
  };
}
