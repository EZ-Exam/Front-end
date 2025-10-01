import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ 
  isVisible, 
  message = "Đang xử lý...", 
  className 
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
        className
      )}
    >
      <div className="bg-white rounded-lg p-8 shadow-2xl flex flex-col items-center space-y-4 min-w-[200px]">
        {/* Spinner Animation */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-pulse border-t-blue-400"></div>
        </div>
        
        {/* Loading Message */}
        <div className="text-center">
          <p className="text-gray-700 font-medium text-sm">{message}</p>
          <div className="flex space-x-1 mt-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.1s]"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom hook để quản lý loading state
export function useLoadingOverlay() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState("Đang xử lý...");

  const showLoading = React.useCallback((message?: string) => {
    setLoadingMessage(message || "Đang xử lý...");
    setIsLoading(true);
  }, []);

  const hideLoading = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = React.useCallback(async <T,>(
    asyncFn: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    try {
      showLoading(message);
      const result = await asyncFn();
      return result;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  return {
    isLoading,
    loadingMessage,
    showLoading,
    hideLoading,
    withLoading
  };
}
