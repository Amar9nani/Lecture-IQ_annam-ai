import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle, FileVideo } from 'lucide-react';
import { VideoFile } from '../types';

interface FileUploaderProps {
  onFileSelected: (videoFile: VideoFile) => void;
}

const FileUploader = ({ onFileSelected }: FileUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<VideoFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const file = acceptedFiles[0];
    
    // Check if it's an MP4 file
    if (file.type !== 'video/mp4') {
      setError('Only MP4 video files are supported');
      return;
    }
    
    // Create a video element to get duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const durationMinutes = video.duration / 60;
      
      // Validate video length (optional)
      if (durationMinutes < 1) {
        setError('Video is too short. Please upload a longer lecture video.');
        return;
      }
      
      // Process the file
      setSelectedFile({
        file,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        duration: video.duration
      });
    };
    
    video.onerror = () => {
      setError('Could not load video metadata. The file might be corrupted.');
    };
    
    video.src = URL.createObjectURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleClearSelection = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleConfirm = () => {
    if (selectedFile) {
      onFileSelected(selectedFile);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
                ${isDragReject || error ? 'border-error-500 bg-error-50' : ''}
              `}
            >
              <input {...getInputProps()} />
              
              <div className="flex flex-col items-center">
                <div className={`p-3 rounded-full mb-4 
                  ${isDragActive ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}
                  ${isDragReject || error ? 'bg-error-100 text-error-600' : ''}
                `}>
                  <Upload size={24} />
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {isDragActive 
                    ? 'Drop the video file here' 
                    : 'Drag and drop your lecture video'}
                </h3>
                
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse (MP4 only)
                </p>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-error-600 mt-2 p-2 bg-error-50 rounded-md"
                  >
                    {error}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Selected Video</h3>
              <button 
                onClick={handleClearSelection}
                className="text-gray-500 hover:text-error-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 rounded-md p-3 text-gray-500">
                  <FileVideo size={32} />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{selectedFile.title}</h4>
                  <div className="text-sm text-gray-500 mb-1">
                    Duration: {formatDuration(selectedFile.duration)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Size: {(selectedFile.file.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleConfirm}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  <CheckCircle size={18} />
                  <span>Process Video</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUploader;