# LectureIQ - Video Lecture Processor

LectureIQ is a sophisticated web application that transforms video lectures into interactive learning materials. It automatically transcribes video content and generates multiple-choice questions (MCQs) for every 5-minute segment, making it an invaluable tool for educators and students.

## Features

- **Video Upload**: Support for MP4 video files with a user-friendly drag-and-drop interface
- **Automatic Transcription**: Uses Whisper AI for accurate speech-to-text conversion
- **MCQ Generation**: AI-powered generation of relevant multiple-choice questions
- **Segmented Processing**: Breaks down lectures into 5-minute segments for better organization
- **Export Options**: Export transcripts and questions in JSON or PDF formats
- **Privacy-Focused**: All processing happens locally, ensuring data privacy
- **Real-time Progress**: Live status updates during processing

## Tech Stack

### Frontend
- React 18.3 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- React Query for data fetching
- Lucide React for icons

### Backend
- Node.js with Express
- TypeScript
- Supabase for database
- Multer for file uploads

### AI Components
- Whisper AI for transcription
- Local LLM for question generation

## Getting Started

### Prerequisites
- Node.js 16+
- Supabase account
- Local installation of Whisper and an LLM (e.g., Ollama with Mistral or Gemma)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd lectureiq
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update with your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your-supabase-url
     VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. In a separate terminal, start the backend server:
   ```bash
   npm run server
   ```

### Database Setup

The application uses Supabase as its database. The schema includes tables for:
- Videos
- Transcripts
- Questions

Run the migrations in `supabase/migrations` to set up your database schema.

## Usage

1. **Upload Video**
   - Drag and drop or click to select an MP4 video file
   - The video will be processed in three stages:
     1. Upload
     2. Transcription
     3. Question Generation

2. **View Results**
   - Browse through 5-minute segments
   - Review transcripts and generated questions
   - Export results in JSON or PDF format

3. **Export Options**
   - JSON Export: Structured data format for programmatic use
   - PDF Export: Formatted document for printing or sharing
   - Copy to Clipboard: Quick access to results

## Project Structure

```
lectureiq/
├── src/
│   ├── api/          # API client functions
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility libraries
│   ├── pages/        # Page components
│   ├── server/       # Backend server code
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Helper functions
├── supabase/
│   └── migrations/   # Database migrations
└── public/          # Static assets
```

## Contact

For questions or support, contact:
- Email: namarnadh.9@gmail.com
