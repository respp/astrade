import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

export interface TradingErrorHandler {
  showInsufficientBalance: boolean;
  setShowInsufficientBalance: (show: boolean) => void;
  handleTradeError: (error: any, lastError?: string) => void;
  closeInsufficientBalanceModal: () => void;
}

export const useTradingErrorHandler = (): TradingErrorHandler => {
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);

  const handleTradeError = useCallback((error: any, lastError?: string) => {
    console.error('Trade failed:', error);
    
    // Debug: Log the error structure to understand what we're receiving
    console.log('🔍 Error structure:', {
      errorType: typeof error,
      errorName: error?.name,
      errorMessage: error?.message,
      errorCode: error?.code,
      errorDetails: error?.details,
      lastError
    });
    
    // Check for specific backend error code 1140 (insufficient balance)
    // The API client now properly extracts the error code, so we can check error.code directly
    const hasErrorCode1140 = error?.code === '1140' || 
                            error?.code === 1140 ||
                            error?.details?.error?.code === 1140 || 
                            error?.details?.code === 1140 ||
                            (error?.details && error.details.error && error.details.error.code === 1140);
    
    if (hasErrorCode1140) {
      console.log('👽 Detected insufficient balance error (code 1140)');
      console.log('👽 Error code:', error?.code);
      console.log('👽 Error details:', error?.details);
      setShowInsufficientBalance(true);
      return;
    }

    // Check for insufficient balance in error message
    const errorMessage = error instanceof Error ? error.message : String(error);
    const lastErrorMessage = lastError || '';
    
    const isInsufficientBalance = 
      errorMessage.toLowerCase().includes('insufficient') || 
      errorMessage.toLowerCase().includes('balance') ||
      errorMessage.toLowerCase().includes('funds') ||
      errorMessage.toLowerCase().includes('not enough') ||
      errorMessage.toLowerCase().includes('exceeds available balance') ||
      errorMessage.toLowerCase().includes('new order cost exceeds available balance') ||
      errorMessage.toLowerCase().includes('lock is not acquired') || // This is a consequence of insufficient balance
      lastErrorMessage.toLowerCase().includes('insufficient') ||
      lastErrorMessage.toLowerCase().includes('exceeds available balance') ||
      lastErrorMessage.toLowerCase().includes('new order cost exceeds available balance') ||
      lastErrorMessage.toLowerCase().includes('lock is not acquired'); // This is a consequence of insufficient balance

    if (isInsufficientBalance) {
      console.log('👽 Detected insufficient balance error from message');
      console.log('👽 Error message:', errorMessage);
      console.log('👽 Last error:', lastErrorMessage);
      setShowInsufficientBalance(true);
      return;
    }
    
    // Handle other specific errors
    let alertMessage = 'Something went wrong with your trade.';
    
    if (lastError) {
      if (lastError.includes('Invalid price precision')) {
        alertMessage = 'Price format error. Please try again.';
      } else if (lastError.includes('Lock is not acquired')) {
        alertMessage = 'Trading system is initializing. Please wait a moment and try again.';
      } else if (lastError.includes('Failed to initialize')) {
        alertMessage = 'Trading client connection failed. Please check your settings.';
      } else if (lastError.includes('Network error')) {
        alertMessage = 'Network connection issue. Please check your internet connection.';
      } else if (lastError.includes('Rate limit')) {
        alertMessage = 'Too many requests. Please wait a moment before trying again.';
      } else {
        alertMessage = lastError;
      }
    }
    
    console.log('⚠️ Showing generic error alert:', alertMessage);
    Alert.alert('❌ Trade Failed', alertMessage);
  }, []);

  const closeInsufficientBalanceModal = useCallback(() => {
    setShowInsufficientBalance(false);
  }, []);

  return {
    showInsufficientBalance,
    setShowInsufficientBalance,
    handleTradeError,
    closeInsufficientBalanceModal
  };
}; 