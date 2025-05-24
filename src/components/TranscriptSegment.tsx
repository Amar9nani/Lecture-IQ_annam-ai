import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { TranscriptSegmentWithQuestions } from '../types';

interface TranscriptSegmentProps {
  segment: TranscriptSegmentWithQuestions;
  index: number;
}

const TranscriptSegment = ({ segment, index }: TranscriptSegmentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-gray-500">
            <Clock size={16} />
            <span className="text-sm font-medium">
              {formatTime(segment.segment_start)} - {formatTime(segment.segment_end)}
            </span>
          </div>
          <h3 className="font-medium text-gray-900">
            Segment {Math.floor(segment.segment_start / 300) + 1}
          </h3>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-primary-600 font-medium">
            {segment.questions.length} question{segment.questions.length !== 1 ? 's' : ''}
          </span>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="p-4 bg-gray-50">
              <h4 className="font-medium text-gray-700 mb-2">Transcript</h4>
              <p className="text-gray-600 text-sm mb-6 whitespace-pre-line">
                {segment.text}
              </p>
              
              <h4 className="font-medium text-gray-700 mb-3">
                Multiple Choice Questions
              </h4>
              
              <div className="space-y-6">
                {segment.questions.map((question, qIndex) => (
                  <div key={question.id} className="bg-white p-4 rounded-md border border-gray-200">
                    <p className="font-medium text-gray-900 mb-3">
                      {qIndex + 1}. {question.question_text}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      {question.options.map((option, oIndex) => (
                        <div
                          key={oIndex}
                          className={`p-3 rounded-md border ${
                            oIndex === question.correct_option
                              ? 'border-success-300 bg-success-50'
                              : 'border-gray-200 hover:border-gray-300'
                          } transition-colors`}
                        >
                          <div className="flex items-start">
                            <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 text-sm font-medium ${
                              oIndex === question.correct_option
                                ? 'bg-success-100 text-success-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {String.fromCharCode(65 + oIndex)}
                            </div>
                            <span className={`text-sm ${
                              oIndex === question.correct_option
                                ? 'text-success-700 font-medium'
                                : 'text-gray-700'
                            }`}>
                              {option}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TranscriptSegment;