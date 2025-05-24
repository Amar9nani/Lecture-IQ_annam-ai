import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Setup express app
const app = express();
const PORT = 3001;

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 500 // 500 MB max file size
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'video/mp4') {
      return cb(new Error('Only MP4 files are allowed'));
    }
    cb(null, true);
  }
});

// Setup Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Export endpoint
app.get('/api/videos/:id/export', async (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.query;

    // Get video data from Supabase
    const { data: videoData, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();

    if (videoError) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    // Get transcript and questions
    const { data: transcriptData, error: transcriptError } = await supabase
      .from('transcripts')
      .select(`
        *,
        questions (*)
      `)
      .eq('video_id', id)
      .order('segment_start');

    if (transcriptError) {
      return res.status(500).json({ success: false, error: 'Failed to fetch transcript data' });
    }

    if (format === 'json') {
      // Format data for JSON export
      const exportData = {
        video: {
          title: videoData.title,
          duration: videoData.duration,
          created_at: videoData.created_at
        },
        segments: transcriptData.map(segment => ({
          time_range: `${Math.floor(segment.segment_start / 60)}:${(segment.segment_start % 60).toString().padStart(2, '0')} - ${Math.floor(segment.segment_end / 60)}:${(segment.segment_end % 60).toString().padStart(2, '0')}`,
          transcript: segment.text,
          questions: segment.questions.map(q => ({
            question: q.question_text,
            options: q.options,
            correct_answer: q.options[q.correct_option]
          }))
        }))
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=lecture-${id}.json`);
      return res.json(exportData);
    } 
    else if (format === 'pdf') {
      // Generate PDF content
      const pdfContent = transcriptData.map(segment => ({
        timeRange: `${Math.floor(segment.segment_start / 60)}:${(segment.segment_start % 60).toString().padStart(2, '0')} - ${Math.floor(segment.segment_end / 60)}:${(segment.segment_end % 60).toString().padStart(2, '0')}`,
        transcript: segment.text,
        questions: segment.questions
      }));

      // Send PDF response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=lecture-${id}.pdf`);
      
      // In a real implementation, you would use a PDF library here
      // For now, we'll send a simple PDF
      const pdfBuffer = Buffer.from(`Generated PDF for lecture ${id}`);
      return res.send(pdfBuffer);
    }

    return res.status(400).json({ success: false, error: 'Invalid export format' });

  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ success: false, error: 'Server error during export' });
  }
});

// Other existing routes...
app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    const { title, duration } = req.body;
    
    if (!title || !duration) {
      return res.status(400).json({ success: false, error: 'Title and duration are required' });
    }
    
    const { data, error } = await supabase
      .from('videos')
      .insert({
        title,
        duration: parseInt(duration),
        file_path: req.file.path,
        status: 'pending',
        progress: 0
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ success: false, error: 'Failed to save video information' });
    }
    
    return res.status(201).json({ 
      success: true, 
      data: { 
        videoId: data.id,
        title: data.title,
        status: data.status
      } 
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ success: false, error: 'Server error during upload' });
  }
});

app.get('/api/videos/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }
    
    return res.status(200).json({ 
      success: true, 
      data: {
        status: data.status,
        progress: data.progress,
        error_message: data.error_message
      } 
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({ success: false, error: 'Server error checking status' });
  }
});

app.get('/api/videos/:id/results', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: videoData, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (videoError) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }
    
    const { data: transcriptData, error: transcriptError } = await supabase
      .from('transcripts')
      .select('*')
      .eq('video_id', id)
      .order('segment_start');
    
    if (transcriptError) {
      return res.status(500).json({ success: false, error: 'Failed to fetch transcript data' });
    }
    
    const transcriptSegmentsWithQuestions = await Promise.all(
      transcriptData.map(async (segment) => {
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('transcript_id', segment.id);
        
        if (questionsError) {
          console.error('Failed to fetch questions for segment:', segment.id);
          return { ...segment, questions: [] };
        }
        
        return { ...segment, questions: questionsData };
      })
    );
    
    return res.status(200).json({
      success: true,
      data: {
        video: videoData,
        segments: transcriptSegmentsWithQuestions
      }
    });
    
  } catch (error) {
    console.error('Results fetch error:', error);
    return res.status(500).json({ success: false, error: 'Server error fetching results' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});