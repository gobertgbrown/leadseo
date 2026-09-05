import React, { useState, useEffect } from 'react';
import { CustomPage } from '../types.js';
import { ArrowLeft, Clock, FileText, ChevronRight } from 'lucide-react';

interface CustomPageViewProps {
  slug: string;
  onNavigateHome: () => void;
}

export const CustomPageView: React.FC<CustomPageViewProps> = ({ slug, onNavigateHome }) => {
  const [page, setPage] = useState<CustomPage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/pages/${slug}`);
      const data = await res.json();
      if (data.success && data.page) {
        setPage(data.page);
      } else {
        setError(data.error || 'Page not found');
      }
    } catch {
      setError('Failed to load page content');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-[#595768]">
        Loading page content...
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <FileText className="w-12 h-12 text-[#c7c4d8] mb-3" />
        <h2 className="text-xl font-bold text-[#131b2e] mb-2">Page Not Found</h2>
        <p className="text-xs text-[#595768] mb-4">
          The custom page you are looking for does not exist or has been unpublished.
        </p>
        <button
          onClick={onNavigateHome}
          className="px-4 py-2 bg-[#3525cd] text-white text-xs font-bold rounded-xl"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div id="custom-page-view" className="min-h-screen bg-[#faf8ff] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#131b2e] to-[#1f293d] text-white py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">{page.title}</h1>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Last updated: {new Date(page.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#eaedff]">
          <div className="prose max-w-none text-sm sm:text-base text-[#131b2e] leading-relaxed whitespace-pre-line">
            {page.content}
          </div>
        </div>
      </div>
    </div>
  );
};
