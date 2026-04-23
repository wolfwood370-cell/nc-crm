import { useContext } from 'react';
import { PrivacyModeContext } from './privacyModeContext';

export const usePrivacyMode = () => {
  const ctx = useContext(PrivacyModeContext);
  if (!ctx) throw new Error('usePrivacyMode must be used within PrivacyModeProvider');
  return ctx;
};
