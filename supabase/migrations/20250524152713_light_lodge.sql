/*
  # Add question options table and enhance questions

  1. New Tables
    - `question_options`
      - `id` (uuid, primary key)
      - `question_id` (uuid, foreign key)
      - `text` (text)
      - `is_correct` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on question_options table
    - Add policies for authenticated users
*/

-- Create question options table
CREATE TABLE IF NOT EXISTS question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;

-- Create policies for question options
CREATE POLICY "Users can insert options for questions they own"
  ON question_options
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM questions
      JOIN segments ON questions.segment_id = segments.id
      JOIN videos ON segments.video_id = videos.id
      WHERE questions.id = question_options.question_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can select options of questions they own"
  ON question_options
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM questions
      JOIN segments ON questions.segment_id = segments.id
      JOIN videos ON segments.video_id = videos.id
      WHERE questions.id = question_options.question_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update options of questions they own"
  ON question_options
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM questions
      JOIN segments ON questions.segment_id = segments.id
      JOIN videos ON segments.video_id = videos.id
      WHERE questions.id = question_options.question_id
      AND videos.user_id = auth.uid()
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);