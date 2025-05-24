/*
  # Initial Schema for Video Lecture Processor

  1. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `title` (text)
      - `duration` (integer)
      - `file_path` (text)
      - `status` (text)
      - `progress` (integer)
      - `error_message` (text, nullable)
      - `created_at` (timestamptz)

    - `transcripts`
      - `id` (uuid, primary key)
      - `video_id` (uuid, foreign key)
      - `segment_start` (integer)
      - `segment_end` (integer)
      - `text` (text)
      - `created_at` (timestamptz)

    - `questions`
      - `id` (uuid, primary key)
      - `transcript_id` (uuid, foreign key)
      - `question_text` (text)
      - `options` (text[])
      - `correct_option` (integer)
      - `created_at` (timestamptz)
      
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  duration INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle',
  progress INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Create transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  segment_start INTEGER NOT NULL,
  segment_end INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id uuid REFERENCES transcripts(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_option INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can insert their own videos" ON videos;
    DROP POLICY IF EXISTS "Users can view their own videos" ON videos;
    DROP POLICY IF EXISTS "Users can update their own videos" ON videos;
    DROP POLICY IF EXISTS "Users can delete their own videos" ON videos;
    DROP POLICY IF EXISTS "Users can insert transcripts for their videos" ON transcripts;
    DROP POLICY IF EXISTS "Users can view transcripts for their videos" ON transcripts;
    DROP POLICY IF EXISTS "Users can insert questions for their transcripts" ON questions;
    DROP POLICY IF EXISTS "Users can view questions for their transcripts" ON questions;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Create policies for videos table
CREATE POLICY "Users can insert their own videos"
  ON videos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own videos"
  ON videos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON videos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON videos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for transcripts table
CREATE POLICY "Users can insert transcripts for their videos"
  ON transcripts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = transcripts.video_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view transcripts for their videos"
  ON transcripts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = transcripts.video_id
      AND videos.user_id = auth.uid()
    )
  );

-- Create policies for questions table
CREATE POLICY "Users can insert questions for their transcripts"
  ON questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transcripts
      JOIN videos ON transcripts.video_id = videos.id
      WHERE transcripts.id = questions.transcript_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view questions for their transcripts"
  ON questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transcripts
      JOIN videos ON transcripts.video_id = videos.id
      WHERE transcripts.id = questions.transcript_id
      AND videos.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_video_id ON transcripts(video_id);
CREATE INDEX IF NOT EXISTS idx_questions_transcript_id ON questions(transcript_id);