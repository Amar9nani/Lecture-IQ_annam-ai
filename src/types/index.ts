export interface UploadState {
  status: 'idle' | 'uploading' | 'transcribing' | 'generating' | 'completed' | 'error';
  progress: number;
  videoId?: string;
  error?: string;
}

export interface VideoFile {
  file: File;
  title: string;
  duration: number;
}

export interface TranscriptSegmentWithQuestions {
  id: string;
  video_id: string;
  segment_start: number;
  segment_end: number;
  text: string;
  created_at: string;
  questions: Question[];
}

export interface Question {
  id: string;
  transcript_id: string;
  question_text: string;
  options: string[];
  correct_option: number;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}