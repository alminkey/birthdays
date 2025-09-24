import React from 'react';
import { CelebrationsProvider } from './CelebrationsContext';

export default function AppProviders({ children }) {
  return <CelebrationsProvider>{children}</CelebrationsProvider>;
}
