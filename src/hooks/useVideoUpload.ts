import { useState } from 'react';
import { VideoFile } from '../types';
import { uploadVideo } from '../api/videoApi';

interface UseVideoUploadReturn {
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  uploadVideo: (videoFile: VideoFile) => Promise<string | null>;
  resetUpload: () => void;
}

export const useVideoUpload = (): UseVideoUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const upload = async (videoFile: VideoFile): Promise<string | null> => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);
      
      // Actual upload
      const result = await uploadVideo(videoFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (!result.success) {
        setUploadError(result.error || 'Upload failed');
        setIsUploading(false);
        return null;
      }
      
      setIsUploading(false);
      return result.data?.videoId || null;
      
    } catch (error) {
      setUploadError('An unexpected error occurred during upload');
      setIsUploading(false);
      console.error('Upload error:', error);
      return null;
    }
  };
  
  const resetUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
  };
  
  return {
    isUploading,
    uploadProgress,
    uploadError,
    uploadVideo: upload,
    resetUpload
  };
};

export default useVideoUpload;