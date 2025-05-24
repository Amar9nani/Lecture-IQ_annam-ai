/*
  # Initial Schema for Video Lecture Processor

  1. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `title` (text)
      - `user_id` (uuid, references auth.users)
      - `file_path` (text)
      - `duration` (integer)
      - `status` (text)
      - `progress` (integer)
      - `error_message` (text, nullable)
      - `created_at` (timestamptz)

    - `segments`
      - `id` (uuid, primary key)
      - `video_id` (uuid, foreign key)
      - `start_time` (numeric)
      - `end_time` (numeric)
      - `transcript` (text)
      - `created_at` (timestamptz)

    - `questions`
      - `id` (uuid, primary key)
      - `segment_id` (uuid, foreign key)
      - `text` (text)
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

-- Create segments table
CREATE TABLE IF NOT EXISTS segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  start_time NUMERIC NOT NULL,
  end_time NUMERIC NOT NULL,
  transcript TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id uuid REFERENCES segments(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can insert their own videos" ON videos;
    DROP POLICY IF EXISTS "Users can view their own videos" ON videos;
    DROP POLICY IF EXISTS "Users can update their own videos" ON videos;
    DROP POLICY IF EXISTS "Users can delete their own videos" ON videos;
    DROP POLICY IF EXISTS "Users can insert segments for videos they own" ON segments;
    DROP POLICY IF EXISTS "Users can select segments of videos they own" ON segments;
    DROP POLICY IF EXISTS "Users can update segments of videos they own" ON segments;
    DROP POLICY IF EXISTS "Users can insert questions for segments they own" ON questions;
    DROP POLICY IF EXISTS "Users can select questions of segments they own" ON questions;
    DROP POLICY IF EXISTS "Users can update questions of segments they own" ON questions;
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

-- Create policies for segments table
CREATE POLICY "Users can insert segments for videos they own"
  ON segments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = segments.video_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can select segments of videos they own"
  ON segments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = segments.video_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update segments of videos they own"
  ON segments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = segments.video_id
      AND videos.user_id = auth.uid()
    )
  );

-- Create policies for questions table
CREATE POLICY "Users can insert questions for segments they own"
  ON questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM segments
      JOIN videos ON segments.video_id = videos.id
      WHERE segments.id = questions.segment_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can select questions of segments they own"
  ON questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM segments
      JOIN videos ON segments.video_id = videos.id
      WHERE segments.id = questions.segment_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update questions of segments they own"
  ON questions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM segments
      JOIN videos ON segments.video_id = videos.id
      WHERE segments.id = questions.segment_id
      AND videos.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_segments_video_id ON segments(video_id);
CREATE INDEX IF NOT EXISTS idx_questions_segment_id ON questions(segment_id);