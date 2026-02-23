import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { ImageDocument, Annotation } from '../types';
import { EVALUATION_SCALES } from '../types';
import ProgressBar from './ProgressBar';
import ImageViewer from './ImageViewer';
import ScaleSelector from './ScaleSelector';
import HallucinationSelector from './HallucinationSelector';

interface AnnotationPageProps {
  onNavigate: (page: 'annotate' | 'explore') => void;
}

export default function AnnotationPage({ onNavigate }: AnnotationPageProps) {
  const { user, logout } = useAuth();
  const [allImages, setAllImages] = useState<ImageDocument[]>([]);
  const [currentImage, setCurrentImage] = useState<ImageDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [downloading, setDownloading] = useState(false);

  // Annotation state
  const [scores, setScores] = useState({
    regionalCulturalAuthenticity: -1,
    folkArtStylisticFidelity: -1,
    symbolicNarrativeDepth: -1,
    visualCoherenceComposition: -1,
    emotionalCulturalExpressiveness: -1,
  });
  const [hallucination, setHallucination] = useState<boolean | null>(null);

  const userEmail = user?.email || '';

  // Find the next image to annotate for this user
  const findNextImage = useCallback((images: ImageDocument[]) => {
    for (const img of images) {
      const userAnnotation = img.annotations?.find(
        (a) => a.annotatorEmail === userEmail && a.done
      );
      if (!userAnnotation) {
        return img;
      }
    }
    return null; // All images annotated
  }, [userEmail]);

  // Count completed annotations for this user
  const countCompleted = useCallback((images: ImageDocument[]) => {
    return images.filter((img) =>
      img.annotations?.some((a) => a.annotatorEmail === userEmail && a.done)
    ).length;
  }, [userEmail]);

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
        setCurrentImage(findNextImage(images));
        setCompletedCount(countCompleted(images));
      } catch (error) {
        console.error('Error loading images:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [findNextImage, countCompleted]);

  // Reset form when image changes
  useEffect(() => {
    setScores({
      regionalCulturalAuthenticity: -1,
      folkArtStylisticFidelity: -1,
      symbolicNarrativeDepth: -1,
      visualCoherenceComposition: -1,
      emotionalCulturalExpressiveness: -1,
    });
    setHallucination(null);
  }, [currentImage?.id]);

  // Check if form is complete
  const isFormComplete = 
    Object.values(scores).every((s) => s >= 0) && 
    hallucination !== null;

  // Download entire database as JSON
  const handleDownloadDatabase = async () => {
    setDownloading(true);
    try {
      const q = query(
        collection(db, 'folk_image_generations'),
        orderBy('id', 'asc')
      );
      const snapshot = await getDocs(q);
      const data: ImageDocument[] = [];
      snapshot.forEach((doc) => {
        data.push({ ...doc.data() } as ImageDocument);
      });
      
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `folk_image_annotations_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading database:', error);
      alert('Failed to download database');
    } finally {
      setDownloading(false);
    }
  };

  // Handle score change with auto-save (draft)
  const handleScoreChange = (key: keyof typeof scores, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  // Submit annotation and mark as done
  const handleSubmit = async () => {
    if (!currentImage || !isFormComplete) return;

    setSaving(true);
    try {
      const annotation: Annotation = {
        annotatorEmail: userEmail,
        timestamp: new Date().toISOString(),
        scores: {
          regionalCulturalAuthenticity: scores.regionalCulturalAuthenticity,
          folkArtStylisticFidelity: scores.folkArtStylisticFidelity,
          symbolicNarrativeDepth: scores.symbolicNarrativeDepth,
          visualCoherenceComposition: scores.visualCoherenceComposition,
          emotionalCulturalExpressiveness: scores.emotionalCulturalExpressiveness,
        },
        hallucination: hallucination!,
        done: true,
      };

      // Get the document reference using the image id
      const docRef = doc(db, 'folk_image_generations', String(currentImage.id));
      
      await updateDoc(docRef, {
        annotations: arrayUnion(annotation)
      });

      // Update local state
      const updatedImages = allImages.map((img) => {
        if (img.id === currentImage.id) {
          return {
            ...img,
            annotations: [...(img.annotations || []), annotation],
          };
        }
        return img;
      });

      setAllImages(updatedImages);
      setCompletedCount(countCompleted(updatedImages));
      setCurrentImage(findNextImage(updatedImages));

    } catch (error) {
      console.error('Error saving annotation:', error);
      alert('Failed to save annotation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-stone-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-stone-500 text-base sm:text-lg">Loading images...</p>
        </div>
      </div>
    );
  }

  if (!currentImage) {
    return (
      <div className="min-h-screen bg-stone-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <Header onLogout={logout} />
          <ProgressBar current={completedCount} total={allImages.length} />
          
          <div className="mt-6 sm:mt-8 bg-stone-50 rounded-2xl p-8 sm:p-12 text-center border border-stone-200">
            <div className="text-5xl sm:text-6xl mb-4">🎉</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-700 mb-4">All Done!</h2>
            <p className="text-stone-500 text-base sm:text-lg">
              You have annotated all {allImages.length} images. Thank you for your contribution!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Count completed scales for summary
  const completedScales = Object.values(scores).filter(s => s >= 0).length;
  const totalScales = 5;

  return (
    <>
      {/* MOBILE LAYOUT - Scrollable */}
      <div className="lg:hidden min-h-screen bg-stone-100 pb-24">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-stone-100 p-3 border-b border-stone-200">
          <Header onLogout={logout} />
        </div>

        <div className="px-3 pt-3">
          {/* Progress */}
          <div className="mb-3">
            <ProgressBar current={completedCount} total={allImages.length} />
          </div>

          {/* Image Section */}
          <div className="mb-3">
            <ImageViewer image={currentImage} />
          </div>

          {/* Quick Summary Card */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <div>
                  <h3 className="font-bold text-stone-700 text-sm">Rating Summary</h3>
                  <p className="text-xs text-stone-500">
                    {completedScales}/{totalScales} scales • {hallucination !== null ? '✓' : '○'} hallucination
                  </p>
                </div>
              </div>
              
              {/* Quick score preview */}
              <div className="flex items-center gap-1">
                {EVALUATION_SCALES.map((scale, idx) => (
                  <div
                    key={scale.key}
                    className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
                      scores[scale.key] >= 0
                        ? 'bg-stone-600 text-white'
                        : 'bg-stone-200 text-stone-400'
                    }`}
                    title={scale.title}
                  >
                    {scores[scale.key] >= 0 ? scores[scale.key] : idx + 1}
                  </div>
                ))}
                <div
                  className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
                    hallucination !== null
                      ? hallucination ? 'bg-red-400 text-white' : 'bg-green-500 text-white'
                      : 'bg-stone-200 text-stone-400'
                  }`}
                  title="Hallucination"
                >
                  {hallucination !== null ? (hallucination ? 'Y' : 'N') : 'H'}
                </div>
              </div>
            </div>
          </div>

          {/* Annotation Form Section */}
          <div className="space-y-3">
            {EVALUATION_SCALES.map((scale) => (
              <ScaleSelector
                key={scale.key}
                scale={scale}
                value={scores[scale.key]}
                onChange={(value) => handleScoreChange(scale.key, value)}
                disabled={saving}
              />
            ))}

            <HallucinationSelector
              value={hallucination}
              onChange={setHallucination}
              disabled={saving}
            />
          </div>
        </div>

        {/* Fixed Submit Button - Mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-stone-50 border-t border-stone-200 p-3 z-50">
          <SubmitButton
            isFormComplete={isFormComplete}
            saving={saving}
            onSubmit={handleSubmit}
            scores={scores}
            hallucination={hallucination}
            compact
          />
        </div>
      </div>

      {/* DESKTOP LAYOUT - 2 Column, Single Screen Height */}
      <div className="hidden lg:flex flex-col h-screen bg-stone-100 overflow-hidden">
        {/* Slim Header */}
        <div className="shrink-0 px-4 py-2 border-b border-stone-200 bg-white">
          <div className="flex items-center justify-between">
            {/* Left: Brand */}
            <div className="flex items-center gap-2">
              <span className="text-xl">🎨</span>
              <span className="font-semibold text-stone-700 text-sm">Folk Annotator</span>
            </div>

            {/* Center: Navigation + Progress */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
                <button
                  onClick={() => onNavigate('annotate')}
                  className="px-4 py-1.5 text-sm font-medium rounded-md transition bg-white text-stone-800 shadow-sm"
                >
                  Annotate
                </button>
                <button
                  onClick={() => onNavigate('explore')}
                  className="px-4 py-1.5 text-sm font-medium rounded-md transition text-stone-600 hover:text-stone-800 hover:bg-stone-200"
                >
                  Explore
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-stone-600">{completedCount}/{allImages.length}</span>
                <div className="w-48 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-stone-500 rounded-full transition-all duration-300"
                    style={{ width: `${allImages.length > 0 ? (completedCount / allImages.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Download, User & Sign Out */}
            <div className="flex items-center gap-2">
              {/* Download Database Button */}
              <button
                onClick={handleDownloadDatabase}
                disabled={downloading}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-stone-600 transition"
                title={downloading ? 'Downloading...' : 'Download Database'}
              >
                {downloading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
              </button>

              <div className="group relative">
                <button className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                {/* Email tooltip on hover */}
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

        {/* Main Content - 2 Columns */}
        <div className="flex-1 flex gap-4 p-4 min-h-0 overflow-hidden">
          {/* Left Column - Image & Submit */}
          <div className="w-[45%] flex flex-col gap-3 min-h-0">
            {/* Image Viewer - Takes most of the space */}
            <div className="flex-1 min-h-0">
              <ImageViewer image={currentImage} compact />
            </div>
            
            {/* Submit Button */}
            <div className="shrink-0">
              <SubmitButton
                isFormComplete={isFormComplete}
                saving={saving}
                onSubmit={handleSubmit}
                scores={scores}
                hallucination={hallucination}
              />
            </div>
          </div>

          {/* Right Column - Scoring Scales */}
          <div className="w-[55%] flex flex-col gap-4 min-h-0 overflow-y-auto pr-2">
            {EVALUATION_SCALES.map((scale) => (
              <ScaleSelector
                key={scale.key}
                scale={scale}
                value={scores[scale.key]}
                onChange={(value) => handleScoreChange(scale.key, value)}
                disabled={saving}
                compact
              />
            ))}

            <HallucinationSelector
              value={hallucination}
              onChange={setHallucination}
              disabled={saving}
              compact
            />
          </div>
        </div>
      </div>
    </>
  );
}

// Submit Button Component
function SubmitButton({ 
  isFormComplete, 
  saving, 
  onSubmit, 
  scores, 
  hallucination,
  compact = false
}: { 
  isFormComplete: boolean;
  saving: boolean;
  onSubmit: () => void;
  scores: Record<string, number>;
  hallucination: boolean | null;
  compact?: boolean;
}) {
  const missingCount = Object.values(scores).filter(v => v < 0).length + (hallucination === null ? 1 : 0);
  
  return (
    <button
      onClick={onSubmit}
      disabled={!isFormComplete || saving}
      className={`
        w-full py-3 rounded-xl font-bold text-base transition-all
        ${isFormComplete && !saving
          ? 'bg-stone-600 text-white hover:bg-stone-700 active:bg-stone-800'
          : 'bg-stone-200 text-stone-400 cursor-not-allowed'}
      `}
    >
      {saving ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Saving...
        </span>
      ) : isFormComplete ? (
        <span className="flex items-center justify-center gap-2">
          <span>✓</span>
          <span>Submit & Next</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <span className="bg-stone-400 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
            {missingCount}
          </span>
          <span>{compact ? 'Items Missing' : `${missingCount} rating${missingCount > 1 ? 's' : ''} remaining`}</span>
        </span>
      )}
    </button>
  );
}

// Header Component - Only used on mobile
function Header({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="bg-stone-50 rounded-xl p-3 flex items-center justify-between border border-stone-200 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-2xl shrink-0">🎨</span>
        <div className="min-w-0">
          <h1 className="text-base font-bold text-stone-700 truncate">Folk Annotator</h1>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onLogout}
          className="px-3 py-2 bg-stone-600 hover:bg-stone-700 text-white rounded-lg transition font-medium text-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
