import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import UploadPage from './pages/UploadPage';
import ProcessingPage from './pages/ProcessingPage';
import ResultsPage from './pages/ResultsPage';
import AboutPage from './pages/AboutPage';
import { UploadState } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [session, setSession] = useState<boolean>(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
  });
  const [currentPage, setCurrentPage] = useState<'home' | 'about'>('home');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <LoginPage onLogin={() => setSession(true)} />;
  }

  const renderContent = () => {
    if (currentPage === 'about') {
      return <AboutPage />;
    }

    switch (uploadState.status) {
      case 'idle':
        return (
          <UploadPage 
            onUploadStart={(videoId) => setUploadState({ 
              status: 'uploading', 
              progress: 0,
              videoId 
            })} 
          />
        );
      case 'uploading':
      case 'transcribing':
      case 'generating':
        return (
          <ProcessingPage 
            status={uploadState.status}
            progress={uploadState.progress}
            videoId={uploadState.videoId}
            onProgressUpdate={(status, progress) => 
              setUploadState(prev => ({ ...prev, status, progress }))
            }
            onComplete={() => 
              setUploadState(prev => ({ ...prev, status: 'completed' }))
            }
            onError={(error) => 
              setUploadState(prev => ({ ...prev, status: 'error', error }))
            }
          />
        );
      case 'completed':
        return (
          <ResultsPage 
            videoId={uploadState.videoId!}
            onReset={() => setUploadState({ status: 'idle', progress: 0 })}
          />
        );
      case 'error':
        return (
          <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-error-600 mb-4">Error Processing Video</h2>
            <p className="text-gray-700 mb-6">{uploadState.error || 'An unknown error occurred'}</p>
            <button
              onClick={() => setUploadState({ status: 'idle', progress: 0 })}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        );
      default:
        return <UploadPage onUploadStart={() => {}} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header 
          onNavigate={(page) => setCurrentPage(page)} 
          onLogout={async () => {
            await supabase.auth.signOut();
            setSession(false);
          }}
        />
        <main className="flex-1 container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={uploadState.status + currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
        <footer className="py-6 border-t border-gray-200">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} LectureIQ. All rights reserved.</p>
            <p className="mt-1">
              <a href="mailto:namarnadh.9@gmail.com" className="text-primary-600 hover:text-primary-700">
                namarnadh.9@gmail.com
              </a>
            </p>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;