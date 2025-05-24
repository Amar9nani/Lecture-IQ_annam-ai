// Format time in seconds to a readable format (MM:SS)
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Format file size in bytes to a readable format
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }
};

// Convert transcript segments to downloadable JSON format
export const formatTranscriptForExport = (
  segments: Array<{
    segment_start: number;
    segment_end: number;
    text: string;
    questions: Array<{
      question_text: string;
      options: string[];
      correct_option: number;
    }>;
  }>
): string => {
  const formattedData = segments.map(segment => ({
    timeRange: `${formatTime(segment.segment_start)} - ${formatTime(segment.segment_end)}`,
    transcript: segment.text,
    questions: segment.questions.map(q => ({
      question: q.question_text,
      options: q.options,
      correctAnswer: q.options[q.correct_option],
      correctIndex: q.correct_option
    }))
  }));
  
  return JSON.stringify(formattedData, null, 2);
};

// Generate a title from a video filename
export const generateTitleFromFilename = (filename: string): string => {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  
  // Replace underscores and hyphens with spaces
  const nameWithSpaces = nameWithoutExt.replace(/[_-]/g, " ");
  
  // Capitalize first letter of each word
  return nameWithSpaces
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};