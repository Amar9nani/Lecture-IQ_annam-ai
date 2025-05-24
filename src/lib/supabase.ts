import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure you have created a .env file with:\n' +
    'VITE_SUPABASE_URL=your-project-url\n' +
    'VITE_SUPABASE_ANON_KEY=your-anon-key'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const getVideoById = async (id: string) => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const getTranscriptByVideoId = async (videoId: string) => {
  const { data, error } = await supabase
    .from('transcripts')
    .select('*')
    .eq('video_id', videoId)
    .order('segment_start');

  if (error) throw error;
  return data;
};

export const getQuestionsByTranscriptId = async (transcriptId: string) => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('transcript_id', transcriptId);

  if (error) throw error;
  return data;
};

export const createVideo = async (videoData: Omit<Video, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('videos')
    .insert(videoData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateVideoStatus = async (id: string, status: string, progress?: number) => {
  const { data, error } = await supabase
    .from('videos')
    .update({ status, progress: progress || 0 })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createTranscriptSegment = async (transcriptData: Omit<TranscriptSegment, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('transcripts')
    .insert(transcriptData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createQuestion = async (questionData: Omit<Question, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('questions')
    .insert(questionData)
    .select()
    .single();

  if (error) throw error;
  return data;
};