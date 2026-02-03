import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { ImageDocument } from '../types';

interface ExplorePageProps {
  onNavigate: (page: 'annotate' | 'explore') => void;
}

export default function ExplorePage({ onNavigate }: ExplorePageProps) {
  const { user, logout } = useAuth();
  const [allImages, setAllImages] = useState<ImageDocument[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const userEmail = user?.email || '';

  // Load all images from Firestore
  useEffect(() => {
    const loadImages = async () => {
      try {
        const q = query(
          collection(db, 'folk_image_generations'),
          orderBy('id', 'asc')
        );
        const snapshot = await getDocs(q);
        const images: ImageDocument[] = [];
        snapshot.forEach((doc) => {
          images.push({ ...doc.data(), docId: doc.id } as ImageDocument & { docId: string });
        });
        setAllImages(images);
      } catch (error) {
        console.error('Error loading images:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  // Reset image state when navigating
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [currentIndex]);

  const currentImage = allImages[currentIndex];
  const modelDisplay = currentImage?.model.split('/').pop() || currentImage?.model || '';

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < allImages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, allImages.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-stone-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-stone-500">Loading images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-stone-100 flex flex-col overflow-hidden">
      {/* Slim Header */}
      <div className="shrink-0 px-4 py-2 border-b border-stone-200 bg-white">
        <div className="flex items-center justify-between">
          {/* Left: Brand */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🎨</span>
            <span className="font-semibold text-stone-700 text-sm">Folk Annotator</span>
          </div>

          {/* Center: Navigation */}
          <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
            <button
              onClick={() => onNavigate('annotate')}
              className="px-4 py-1.5 text-sm font-medium rounded-md transition text-stone-600 hover:text-stone-800 hover:bg-stone-200"
            >
              Annotate
            </button>
            <button
              onClick={() => onNavigate('explore')}
              className="px-4 py-1.5 text-sm font-medium rounded-md transition bg-white text-stone-800 shadow-sm"
            >
              Explore
            </button>
          </div>

          {/* Right: User & Sign Out */}
          <div className="flex items-center gap-2">
            <div className="group relative">
              <button className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <div className="absolute right-0 top-full mt-1 px-2 py-1 bg-stone-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {userEmail}
              </div>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded transition text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 min-h-0 overflow-hidden">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition ${
              currentIndex === 0
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-stone-700">
              {currentIndex + 1} / {allImages.length}
            </span>
            <div className="w-32 h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-stone-500 rounded-full transition-all duration-300"
                style={{ width: `${allImages.length > 0 ? ((currentIndex + 1) / allImages.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <button
            onClick={goToNext}
            disabled={currentIndex === allImages.length - 1}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition ${
              currentIndex === allImages.length - 1
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Image Display */}
        {currentImage && (
          <div className="flex-1 flex gap-6 min-h-0">
            {/* Image */}
            <div 
              className="flex-1 bg-white border border-stone-200 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer relative"
              onClick={() => setFullscreen(true)}
            >
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-stone-300 border-t-stone-500 rounded-full animate-spin"></div>
                </div>
              )}
              
              {imageError && (
                <div className="text-center text-stone-500">
                  <div className="text-4xl mb-2">⚠️</div>
                  <p className="font-medium">Failed to load image</p>
                </div>
              )}

              <img
                src={currentImage.image_path}
                alt={`Folk image from ${currentImage.zone}`}
                className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />

              {imageLoaded && (
                <div className="absolute bottom-3 right-3 bg-stone-600/70 text-white text-xs px-2 py-1 rounded">
                  🔍 Click to enlarge
                </div>
              )}
            </div>

            {/* Info Panel */}
            <div className="w-72 shrink-0 bg-white border border-stone-200 rounded-xl p-5 flex flex-col gap-4">
              <div>
                <h2 className="text-2xl font-bold text-stone-800">Image #{currentImage.id}</h2>
                <p className="text-stone-500 text-sm mt-1">Round {currentImage.round_id}</p>
              </div>

              <div className="border-t border-stone-200 pt-4">
                <div className="text-xs uppercase tracking-wider text-stone-400 mb-1">Zone</div>
                <div className="text-xl font-bold text-blue-600">{currentImage.zone}</div>
              </div>

              <div className="border-t border-stone-200 pt-4">
                <div className="text-xs uppercase tracking-wider text-stone-400 mb-1">Model</div>
                <div className="text-sm font-mono font-semibold text-stone-700 break-words">{modelDisplay}</div>
              </div>

              <div className="border-t border-stone-200 pt-4">
                <div className="text-xs uppercase tracking-wider text-stone-400 mb-1">Annotations</div>
                <div className="text-lg font-semibold text-stone-700">
                  {currentImage.annotations?.length || 0} submitted
                </div>
              </div>

              <div className="mt-auto pt-4 text-xs text-stone-400">
                Use ← → arrow keys to navigate
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {fullscreen && currentImage && (
        <div 
          className="fixed inset-0 z-50 bg-stone-900 flex items-center justify-center"
          onClick={() => setFullscreen(false)}
        >
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 z-10 bg-white text-stone-700 px-4 py-2 rounded-lg font-bold hover:bg-stone-100 transition"
          >
            ✕ Close
          </button>
          
          {/* Navigation in fullscreen */}
          <button
            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
            disabled={currentIndex === 0}
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition ${
              currentIndex === 0 ? 'bg-stone-700 text-stone-500' : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            disabled={currentIndex === allImages.length - 1}
            className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition ${
              currentIndex === allImages.length - 1 ? 'bg-stone-700 text-stone-500' : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <img
            src={currentImage.image_path}
            alt={`Folk image from ${currentImage.zone}`}
            className="max-w-full max-h-full object-contain p-4"
          />
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-stone-700 px-4 py-2 rounded-lg text-sm font-medium">
            {currentImage.zone} • {modelDisplay} • Image #{currentImage.id} • {currentIndex + 1}/{allImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
