export interface Database {
  public: {
    Tables: {
      videos: {
        Row: Video;
        Insert: Omit<Video, 'id' | 'created_at'>;
        Update: Partial<Omit<Video, 'id' | 'created_at'>>;
      };
      transcripts: {
        Row: TranscriptSegment;
        Insert: Omit<TranscriptSegment, 'id' | 'created_at'>;
        Update: Partial<Omit<TranscriptSegment, 'id' | 'created_at'>>;
      };
      questions: {
        Row: Question;
        Insert: Omit<Question, 'id' | 'created_at'>;
        Update: Partial<Omit<Question, 'id' | 'created_at'>>;
      };
    };
  };
}

export interface Video {
  id: string;
  title: string;
  duration: number;
  file_path: string;
  status: 'pending' | 'transcribing' | 'generating' | 'completed' | 'error';
  progress: number;
  created_at: string;
  error_message?: string;
}

export interface TranscriptSegment {
  id: string;
  video_id: string;
  segment_start: number;
  segment_end: number;
  text: string;
  created_at: string;
}

export interface Question {
  id: string;
  transcript_id: string;
  question_text: string;
  options: string[];
  correct_option: number;
  created_at: string;
}

export type {
  Video,
  TranscriptSegment,
  Question
};