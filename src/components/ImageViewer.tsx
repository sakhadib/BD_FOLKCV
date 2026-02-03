import { useState } from 'react';
import type { ImageDocument } from '../types';

interface ImageViewerProps {
  image: ImageDocument;
  compact?: boolean;
}

export default function ImageViewer({ image, compact = false }: ImageViewerProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // Extract model name for display (last part after /)
  const modelDisplay = image.model.split('/').pop() || image.model;

  if (compact) {
    // Compact version for desktop 2-column layout - fits in viewport
    return (
      <>
        <div className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden h-full flex flex-col">
          {/* Zone and Model - Top */}
          <div className="bg-stone-100 border-b border-stone-200 p-3 shrink-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="bg-stone-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                #{image.id}
              </span>
              <span className="text-stone-500 text-xs">Round {image.round_id}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                <div className="text-[10px] uppercase tracking-wider text-blue-500">Zone</div>
                <div className="text-base font-bold text-blue-700">{image.zone}</div>
              </div>
              <div className="bg-stone-200 rounded-lg p-2 text-center">
                <div className="text-[10px] uppercase tracking-wider text-stone-500">Model</div>
                <div className="text-xs font-mono font-semibold break-words leading-tight text-stone-700" title={modelDisplay}>
                  {modelDisplay}
                </div>
              </div>
            </div>
          </div>

          {/* Image Container - Fills remaining space */}
          <div 
            className="relative bg-stone-100 flex-1 flex items-center justify-center cursor-pointer min-h-0"
            onClick={() => setFullscreen(true)}
          >
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-3 border-stone-300 border-t-stone-500 rounded-full animate-spin"></div>
                  <span className="text-stone-500 text-xs">Loading...</span>
                </div>
              </div>
            )}
            
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center p-2">
                <div className="text-center text-stone-500">
                  <div className="text-2xl mb-1">⚠️</div>
                  <p className="text-xs font-medium">Failed to load</p>
                </div>
              </div>
            )}

            <img
              src={image.image_path}
              alt={`Folk image from ${image.zone}`}
              className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />

            {/* Enlarge hint */}
            {imageLoaded && (
              <div className="absolute bottom-2 right-2 bg-stone-600/70 text-white text-xs px-2 py-1 rounded">
                🔍 Click to enlarge
              </div>
            )}
          </div>
        </div>

        {/* Fullscreen Modal */}
        {fullscreen && (
          <FullscreenModal
            image={image}
            modelDisplay={modelDisplay}
            onClose={() => setFullscreen(false)}
          />
        )}
      </>
    );
  }

  // Full version for mobile
  return (
    <>
      <div className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden">
        {/* Header with Image Info */}
        <div className="bg-stone-700 text-white p-3 sm:p-4">
          {/* Top Row - ID and Round */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="bg-white text-stone-700 px-2 py-1 rounded text-xs sm:text-sm font-bold">
                #{image.id}
              </span>
              <span className="text-stone-300 text-xs sm:text-sm">Round {image.round_id}</span>
            </div>
            <button
              onClick={() => setFullscreen(true)}
              className="text-xs sm:text-sm bg-stone-600 hover:bg-stone-500 px-3 py-1 rounded transition"
            >
              🔍 Enlarge
            </button>
          </div>
          
          {/* Zone and Model - Prominent Display */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-blue-500 rounded-lg p-3 text-center">
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-blue-100 mb-1">Zone</div>
              <div className="text-lg sm:text-xl font-bold">{image.zone}</div>
            </div>
            <div className="bg-stone-600 rounded-lg p-3 text-center">
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-stone-300 mb-1">Model</div>
              <div className="text-sm sm:text-base font-mono font-semibold break-words leading-tight" title={modelDisplay}>
                {modelDisplay}
              </div>
            </div>
          </div>
        </div>

        {/* Image Container */}
        <div 
          className="relative bg-stone-100 flex items-center justify-center cursor-pointer"
          style={{ minHeight: '50vh', maxHeight: '60vh' }}
          onClick={() => setFullscreen(true)}
        >
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-stone-300 border-t-stone-500 rounded-full animate-spin"></div>
                <span className="text-stone-500 text-sm">Loading image...</span>
              </div>
            </div>
          )}
          
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="text-center text-stone-500">
                <div className="text-4xl mb-2">⚠️</div>
                <p className="font-medium">Failed to load image</p>
                <p className="text-xs mt-2 text-stone-400 break-all">{image.image_path}</p>
              </div>
            </div>
          )}

          <img
            src={image.image_path}
            alt={`Folk image from ${image.zone}`}
            className={`max-w-full max-h-[60vh] object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />

          {/* Tap to enlarge hint */}
          {imageLoaded && (
            <div className="absolute bottom-2 right-2 bg-stone-700/60 text-white text-xs px-2 py-1 rounded">
              Tap to enlarge
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreen && (
        <FullscreenModal
          image={image}
          modelDisplay={modelDisplay}
          onClose={() => setFullscreen(false)}
        />
      )}
    </>
  );
}

// Fullscreen Modal Component
function FullscreenModal({ 
  image, 
  modelDisplay, 
  onClose 
}: { 
  image: ImageDocument; 
  modelDisplay: string; 
  onClose: () => void;
}) {
  return (
    <div 
      className="fixed inset-0 z-50 bg-stone-900 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-white text-stone-700 px-4 py-2 rounded-lg font-bold hover:bg-stone-100 transition"
      >
        ✕ Close
      </button>
      <img
        src={image.image_path}
        alt={`Folk image from ${image.zone}`}
        className="max-w-full max-h-full object-contain p-4"
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-stone-700 px-4 py-2 rounded-lg text-sm font-medium">
        {image.zone} • {modelDisplay} • Image #{image.id}
      </div>
    </div>
  );
}
