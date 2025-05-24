import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { FileText, AlertCircle, RefreshCcw } from 'lucide-react';
import TranscriptSegment from '../components/TranscriptSegment';
import ExportOptions from '../components/ExportOptions';
import { TranscriptSegmentWithQuestions } from '../types';

interface ResultsPageProps {
  videoId: string;
  onReset: () => void;
}

// Mock data function to simulate API call
const fetchResults = async (videoId: string): Promise<{
  videoTitle: string;
  segments: TranscriptSegmentWithQuestions[];
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock segments
  const segments: TranscriptSegmentWithQuestions[] = [];
  
  for (let i = 0; i < 5; i++) {
    const segmentStart = i * 300; // 5 minutes in seconds
    const segmentEnd = (i + 1) * 300;
    
    const questions = [];
    const numQuestions = Math.floor(Math.random() * 3) + 2; // 2-4 questions
    
    for (let j = 0; j < numQuestions; j++) {
      questions.push({
        id: `q_${i}_${j}`,
        transcript_id: `seg_${i}`,
        question_text: `Sample question ${j + 1} for segment ${i + 1}?`,
        options: [
          `Option A for question ${j + 1}`,
          `Option B for question ${j + 1}`,
          `Option C for question ${j + 1}`,
          `Option D for question ${j + 1}`
        ],
        correct_option: Math.floor(Math.random() * 4),
        created_at: new Date().toISOString()
      });
    }
    
    segments.push({
      id: `seg_${i}`,
      video_id: videoId,
      segment_start: segmentStart,
      segment_end: segmentEnd,
      text: `This is the transcript text for segment ${i + 1}. It represents a 5-minute portion of the video lecture. In a real implementation, this would contain the actual transcribed text from the video.`,
      created_at: new Date().toISOString(),
      questions
    });
  }
  
  return {
    videoTitle: 'Introduction to Machine Learning',
    segments
  };
};

const ResultsPage = ({ videoId, onReset }: ResultsPageProps) => {
  const [expandedSegmentId, setExpandedSegmentId] = useState<string | null>(null);
  
  const { data, isLoading, isError, refetch } = useQuery(
    ['videoResults', videoId],
    () => fetchResults(videoId),
    {
      refetchOnWindowFocus: false,
      retry: 1
    }
  );
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-t-2 border-primary-600 border-solid rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
        <div className="p-4 bg-error-50 rounded-full mb-4">
          <AlertCircle size={32} className="text-error-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Results</h2>
        <p className="text-gray-600 mb-6 text-center">
          We couldn't load the results for this video. Please try again.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RefreshCcw size={16} />
            <span>Retry</span>
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Upload Another Video
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {data?.videoTitle}
        </h1>
        <div className="flex items-center text-gray-500 text-sm mb-6">
          <FileText size={16} className="mr-1" />
          <span>{data?.segments.length} segments processed</span>
          <span className="mx-2">•</span>
          <span>{data?.segments.reduce((acc, seg) => acc + seg.questions.length, 0)} questions generated</span>
        </div>
        
        <ExportOptions videoId={videoId} />
      </motion.div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Transcript Segments & Questions
        </h2>
        
        <div className="space-y-4">
          {data?.segments.map((segment, index) => (
            <TranscriptSegment 
              key={segment.id} 
              segment={segment}
              index={index}
            />
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mt-8 mb-4">
        <button
          onClick={onReset}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Process Another Video
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;