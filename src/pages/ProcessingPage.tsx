import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ProgressIndicator from '../components/ProgressIndicator';

interface ProcessingPageProps {
  status: 'uploading' | 'transcribing' | 'generating' | 'completed' | 'error';
  progress: number;
  videoId?: string;
  onProgressUpdate: (status: 'uploading' | 'transcribing' | 'generating' | 'completed', progress: number) => void;
  onComplete: () => void;
  onError: (error: string) => void;
}

const ProcessingPage = ({ 
  status, 
  progress, 
  videoId, 
  onProgressUpdate, 
  onComplete, 
  onError 
}: ProcessingPageProps) => {
  const progressIntervalRef = useRef<number | null>(null);
  
  // Simulate progress updates for demonstration
  useEffect(() => {
    if (!videoId) return;
    
    const simulateProgress = () => {
      if (status === 'uploading' && progress < 100) {
        const newProgress = Math.min(progress + 5, 100);
        onProgressUpdate('uploading', newProgress);
        
        if (newProgress === 100) {
          setTimeout(() => {
            onProgressUpdate('transcribing', 0);
          }, 500);
        }
      } 
      else if (status === 'transcribing' && progress < 100) {
        const newProgress = Math.min(progress + 2, 100);
        onProgressUpdate('transcribing', newProgress);
        
        if (newProgress === 100) {
          setTimeout(() => {
            onProgressUpdate('generating', 0);
          }, 500);
        }
      }
      else if (status === 'generating' && progress < 100) {
        const newProgress = Math.min(progress + 1, 100);
        onProgressUpdate('generating', newProgress);
        
        if (newProgress === 100) {
          clearInterval(progressIntervalRef.current!);
          progressIntervalRef.current = null;
          
          setTimeout(() => {
            onComplete();
          }, 500);
        }
      }
    };
    
    if (!progressIntervalRef.current) {
      progressIntervalRef.current = window.setInterval(simulateProgress, 300);
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [status, progress, videoId, onProgressUpdate, onComplete]);
  
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Processing Your Video</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your video is being processed. This may take a few minutes depending on the length of your lecture.
        </p>
      </motion.div>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-8">
        <ProgressIndicator status={status} progress={progress} />
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-primary-50 p-5 rounded-lg border border-primary-100 text-sm"
      >
        <h3 className="font-medium text-primary-800 mb-2">What's happening now?</h3>
        
        {status === 'uploading' && (
          <p className="text-primary-700">
            Your video is being uploaded and prepared for processing. This should only take a moment.
          </p>
        )}
        
        {status === 'transcribing' && (
          <p className="text-primary-700">
            Using Whisper AI to transcribe the audio from your video into text. This process converts 
            speech to text with high accuracy, even with background noise or accents.
          </p>
        )}
        
        {status === 'generating' && (
          <p className="text-primary-700">
            The transcript has been divided into 5-minute segments. Now, our local LLM is analyzing each 
            segment to generate relevant multiple-choice questions based on the lecture content.
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default ProcessingPage;