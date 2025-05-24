import { useState } from 'react';
import { motion } from 'framer-motion';
import FileUploader from '../components/FileUploader';
import { VideoFile } from '../types';
import { Upload, VideoIcon, BrainCircuit } from 'lucide-react';

interface UploadPageProps {
  onUploadStart: (videoId: string) => void;
}

const UploadPage = ({ onUploadStart }: UploadPageProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelected = async (videoFile: VideoFile) => {
    try {
      setIsUploading(true);
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('video', videoFile.file);
      formData.append('title', videoFile.title);
      formData.append('duration', videoFile.duration.toString());
      
      // In a real implementation, you would send this to your backend
      // For now, we'll simulate a successful upload with a timeout
      setTimeout(() => {
        // Simulate getting a video ID from the backend
        const mockVideoId = 'video_' + Math.random().toString(36).substr(2, 9);
        onUploadStart(mockVideoId);
      }, 1500);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
    }
  };

  const features = [
    {
      icon: <VideoIcon className="text-primary-600" size={24} />,
      title: "Video Transcription",
      description: "Upload lecture videos and get accurate transcriptions using Whisper's advanced AI model."
    },
    {
      icon: <BrainCircuit className="text-primary-600" size={24} />,
      title: "AI-Powered MCQs",
      description: "Automatically generate high-quality multiple-choice questions from your video content."
    },
    {
      icon: <Upload className="text-primary-600" size={24} />,
      title: "Local Processing",
      description: "All processing happens locally, ensuring your data never leaves your computer."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Transform Lecture Videos into MCQs
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload your MP4 lecture video, and our AI will automatically transcribe the content and 
          generate multiple choice questions for every 5-minute segment.
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FileUploader onFileSelected={handleFileSelected} />
          
          {isUploading && (
            <div className="mt-4 p-4 bg-primary-50 rounded-md">
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-primary-600 rounded-full animate-spin mr-3"></div>
                <span className="text-primary-700 text-sm">Uploading video...</span>
              </div>
            </div>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col space-y-6"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + (index * 0.1) }}
              className="bg-white p-5 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-start">
                <div className="mr-4 p-2 bg-primary-50 rounded-md">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gray-50 p-5 rounded-lg border border-gray-200 text-sm text-gray-600"
      >
        <p className="font-medium text-gray-700 mb-2">Requirements:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>MP4 video format</li>
          <li>English language content</li>
          <li>Clear audio quality for best results</li>
          <li>Lectures should be at least 5 minutes long</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default UploadPage;