import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LoadingOverlay, useLoadingOverlay } from '@/components/ui/LoadingOverlay';

interface GlobalLoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T>(asyncFn: () => Promise<T>, message?: string) => Promise<T>;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextType | undefined>(undefined);

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const { isLoading, loadingMessage, showLoading, hideLoading, withLoading } = useLoadingOverlay();

  return (
    <GlobalLoadingContext.Provider value={{
      isLoading,
      loadingMessage,
      showLoading,
      hideLoading,
      withLoading
    }}>
      {children}
      <LoadingOverlay isVisible={isLoading} message={loadingMessage} />
    </GlobalLoadingContext.Provider>
  );
}

export function useGlobalLoading() {
  const context = useContext(GlobalLoadingContext);
  if (context === undefined) {
    throw new Error('useGlobalLoading must be used within a GlobalLoadingProvider');
  }
  return context;
}
