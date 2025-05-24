import { motion } from 'framer-motion';
import { BookOpen, Code, Shield, Cpu } from 'lucide-react';

const AboutPage = () => {
  const features = [
    {
      icon: <BookOpen className="w-6 h-6 text-primary-600" />,
      title: 'Automated Learning',
      description: 'Transform lecture videos into structured learning materials with AI-generated questions.'
    },
    {
      icon: <Shield className="w-6 h-6 text-primary-600" />,
      title: 'Privacy First',
      description: 'All processing happens locally on your machine, ensuring your content remains private.'
    },
    {
      icon: <Cpu className="w-6 h-6 text-primary-600" />,
      title: 'AI Powered',
      description: 'Utilizing state-of-the-art AI models for accurate transcription and question generation.'
    },
    {
      icon: <Code className="w-6 h-6 text-primary-600" />,
      title: 'Open Source',
      description: 'Built with transparency in mind, allowing for community contributions and improvements.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About LectureIQ</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          LectureIQ is an innovative tool that helps educators and students transform video lectures
          into interactive learning materials through AI-powered transcription and question generation.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary-50 rounded-lg">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-primary-50 border border-primary-100 rounded-lg p-8 text-center"
      >
        <h2 className="text-2xl font-bold text-primary-900 mb-4">Get Started Today</h2>
        <p className="text-primary-700 mb-6">
          Experience the future of educational content creation with our AI-powered platform.
        </p>
        <a
          href="mailto:namarnadh.9@gmail.com"
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Contact Us
        </a>
      </motion.div>
    </div>
  );
};

export default AboutPage;