import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileJson, File as FilePdf, Copy, Check } from 'lucide-react';
import { exportData } from '../api/videoApi';

interface ExportOptionsProps {
  videoId: string;
}

const ExportOptions = ({ videoId }: ExportOptionsProps) => {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (format: 'json' | 'pdf') => {
    try {
      setIsExporting(true);
      setError(null);
      const result = await exportData(videoId, format);
      
      if (!result.success) {
        throw new Error(result.error || 'Export failed. Please try again later.');
      }

      if (!result.data?.url) {
        throw new Error('Export URL not found. Please try again later.');
      }

      // Validate URL before attempting download
      try {
        new URL(result.data.url);
      } catch (urlError) {
        throw new Error('Invalid export URL received. Please try again later.');
      }

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = result.data.url;
      link.download = `lecture-${videoId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred during export';
      setError(errorMessage);
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/videos/${videoId}/results`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      const data = await response.json();
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to copy to clipboard';
      console.error('Clipboard error:', err);
      setError(errorMessage);
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-2 mb-4">
        <Download size={18} className="text-gray-500" />
        <h3 className="font-medium text-gray-900">Export Options</h3>
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 rounded-md bg-error-50 text-error-600 text-sm"
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => handleExport('json')}
          disabled={isExporting}
          className="flex items-center justify-center space-x-2 p-3 rounded-md border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileJson size={18} className="text-primary-600" />
          <span className="text-sm font-medium text-gray-700">
            {isExporting ? 'Exporting...' : 'Export JSON'}
          </span>
        </button>
        
        <button
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
          className="flex items-center justify-center space-x-2 p-3 rounded-md border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FilePdf size={18} className="text-primary-600" />
          <span className="text-sm font-medium text-gray-700">
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </span>
        </button>
        
        <button
          onClick={handleCopyToClipboard}
          disabled={isExporting}
          className="flex items-center justify-center space-x-2 p-3 rounded-md border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copiedToClipboard ? (
            <>
              <Check size={18} className="text-success-600" />
              <span className="text-sm font-medium text-success-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={18} className="text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Copy to Clipboard</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ExportOptions;