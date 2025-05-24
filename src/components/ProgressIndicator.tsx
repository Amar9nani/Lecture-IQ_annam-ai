import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  status: 'uploading' | 'transcribing' | 'generating' | 'completed' | 'error';
  progress: number;
}

const statusMessages = {
  uploading: 'Uploading your video...',
  transcribing: 'Transcribing audio with Whisper...',
  generating: 'Generating MCQs with local LLM...',
  completed: 'Process completed successfully!',
  error: 'An error occurred'
};

const ProgressIndicator = ({ status, progress }: ProgressIndicatorProps) => {
  const isCompleted = (checkStatus: string) => {
    const statusOrder = ['uploading', 'transcribing', 'generating', 'completed'];
    const currentIndex = statusOrder.indexOf(status);
    const checkIndex = statusOrder.indexOf(checkStatus);
    
    return currentIndex > checkIndex || (currentIndex === checkIndex && progress === 100);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2"></div>
          
          {/* Animated progress */}
          <motion.div 
            className="absolute top-1/2 left-0 h-0.5 bg-primary-600 -translate-y-1/2"
            initial={{ width: 0 }}
            animate={{ 
              width: status === 'error' 
                ? '33%' 
                : `${Math.min(
                    status === 'uploading' ? progress / 3 : 
                    status === 'transcribing' ? 33 + (progress / 3) :
                    status === 'generating' ? 66 + (progress / 3) :
                    status === 'completed' ? 100 : 0, 
                    100
                  )}%` 
            }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Step indicators */}
          <div className="relative flex justify-between">
            {/* Upload step */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 z-10
                ${isCompleted('uploading') 
                  ? 'bg-primary-600 border-primary-600 text-white' 
                  : status === 'uploading' 
                    ? 'border-primary-600 text-primary-600 bg-white' 
                    : 'border-gray-300 text-gray-400 bg-white'}`
              }>
                <span className="text-sm font-medium">1</span>
              </div>
              <span className="text-xs font-medium mt-2 text-gray-700">Upload</span>
            </div>
            
            {/* Transcription step */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 z-10
                ${isCompleted('transcribing') 
                  ? 'bg-primary-600 border-primary-600 text-white' 
                  : status === 'transcribing' 
                    ? 'border-primary-600 text-primary-600 bg-white' 
                    : 'border-gray-300 text-gray-400 bg-white'}`
              }>
                <span className="text-sm font-medium">2</span>
              </div>
              <span className="text-xs font-medium mt-2 text-gray-700">Transcribe</span>
            </div>
            
            {/* MCQ Generation step */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 z-10
                ${isCompleted('generating') 
                  ? 'bg-primary-600 border-primary-600 text-white' 
                  : status === 'generating' 
                    ? 'border-primary-600 text-primary-600 bg-white' 
                    : 'border-gray-300 text-gray-400 bg-white'}`
              }>
                <span className="text-sm font-medium">3</span>
              </div>
              <span className="text-xs font-medium mt-2 text-gray-700">Generate MCQs</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {statusMessages[status]}
        </h3>
        
        {status !== 'completed' && status !== 'error' && (
          <motion.div 
            className="w-full bg-gray-200 rounded-full h-2.5 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div 
              className="bg-primary-600 h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        )}
        
        {status !== 'completed' && status !== 'error' && (
          <p className="text-sm text-gray-500">{progress}% complete</p>
        )}
      </div>
    </div>
  );
};

export default ProgressIndicator;