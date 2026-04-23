import { createContext } from 'react';

export interface PrivacyModeValue {
  privacyMode: boolean;
  togglePrivacyMode: () => void;
  setPrivacyMode: (v: boolean) => void;
}

export const PrivacyModeContext = createContext<PrivacyModeValue | null>(null);
