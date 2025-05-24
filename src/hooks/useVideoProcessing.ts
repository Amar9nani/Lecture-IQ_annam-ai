import { useState, useEffect, useCallback } from 'react';
import { checkVideoStatus } from '../api/videoApi';

interface UseVideoProcessingReturn {
  status: 'pending' | 'transcribing' | 'generating' | 'completed' | 'error';
  progress: number;
  error: string | null;
  startPolling: (videoId: string) => void;
  stopPolling: () => void;
}

export const useVideoProcessing = (): UseVideoProcessingReturn => {
  const [status, setStatus] = useState<'pending' | 'transcribing' | 'generating' | 'completed' | 'error'>('pending');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
  
  const checkStatus = useCallback(async (id: string) => {
    try {
      const result = await checkVideoStatus(id);
      
      if (!result.success) {
        setError(result.error || 'Failed to check status');
        return;
      }
      
      const { status: newStatus, progress: newProgress, error_message } = result.data!;
      
      setStatus(newStatus as any);
      setProgress(newProgress);
      
      if (error_message) {
        setError(error_message);
      }
      
      if (newStatus === 'completed' || newStatus === 'error') {
        stopPolling();
      }
      
    } catch (err) {
      console.error('Error checking status:', err);
      setError('Failed to check processing status');
    }
  }, []);
  
  const startPolling = useCallback((id: string) => {
    setVideoId(id);
    setStatus('pending');
    setProgress(0);
    setError(null);
    
    // Check immediately
    checkStatus(id);
    
    // Then start polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    const interval = window.setInterval(() => {
      checkStatus(id);
    }, 3000); // Check every 3 seconds
    
    setPollingInterval(interval);
  }, [checkStatus, pollingInterval]);
  
  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);
  
  return {
    status,
    progress,
    error,
    startPolling,
    stopPolling
  };
};

export default useVideoProcessing;