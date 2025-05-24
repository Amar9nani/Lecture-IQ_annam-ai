import axios from 'axios';
import { VideoFile, ApiResponse, TranscriptSegmentWithQuestions } from '../types';

// API base URL from environment variable
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// Upload a video file
export const uploadVideo = async (videoFile: VideoFile): Promise<ApiResponse<{ videoId: string }>> => {
  try {
    const formData = new FormData();
    formData.append('video', videoFile.file);
    formData.append('title', videoFile.title);
    formData.append('duration', videoFile.duration.toString());
    
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading video:', error);
    return {
      success: false,
      error: 'Failed to upload video. Please try again.'
    };
  }
};

// Check the status of a video processing job
export const checkVideoStatus = async (videoId: string): Promise<ApiResponse<{
  status: string;
  progress: number;
  error_message?: string;
}>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/videos/${videoId}/status`);
    return response.data;
  } catch (error) {
    console.error('Error checking video status:', error);
    return {
      success: false,
      error: 'Failed to check video status.'
    };
  }
};

// Get the results for a processed video
export const getVideoResults = async (videoId: string): Promise<ApiResponse<{
  video: {
    id: string;
    title: string;
    duration: number;
    status: string;
  };
  segments: TranscriptSegmentWithQuestions[];
}>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/videos/${videoId}/results`);
    return response.data;
  } catch (error) {
    console.error('Error fetching video results:', error);
    return {
      success: false,
      error: 'Failed to fetch video results.'
    };
  }
};

// Export questions and transcripts
export const exportData = async (videoId: string, format: 'json' | 'pdf'): Promise<ApiResponse<{ url: string }>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/videos/${videoId}/export?format=${format}`);
    return response.data;
  } catch (error: any) {
    // Enhanced error logging
    console.error('Error exporting data:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return {
      success: false,
      error: `Failed to export data as ${format.toUpperCase()}: ${error.message}`
    };
  }
};