import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const FONT_SCALE_KEY = 'accessibility_font_scale';

export const FONT_SCALES = [
  { label: 'Default', value: 1.0 },
  { label: 'Large', value: 1.2 },
  { label: 'Extra Large', value: 1.5 },
];

const AccessibilityContext = createContext({
  fontScale: 1.0,
  setFontScale: () => {},
});

export function AccessibilityProvider({ children }) {
  const [fontScale, setFontScaleState] = useState(1.0);

  useEffect(() => {
    SecureStore.getItemAsync(FONT_SCALE_KEY).then(scale => {
      if (scale) setFontScaleState(parseFloat(scale));
    });
  }, []);

  async function setFontScale(value) {
    setFontScaleState(value);
    await SecureStore.setItemAsync(FONT_SCALE_KEY, String(value));
  }

  return (
    <AccessibilityContext.Provider value={{ fontScale, setFontScale }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
