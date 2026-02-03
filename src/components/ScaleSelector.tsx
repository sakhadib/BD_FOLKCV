import { useState } from 'react';
import type { ScaleInfo } from '../types';

interface ScaleSelectorProps {
  scale: ScaleInfo;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  compact?: boolean;
}

export default function ScaleSelector({ scale, value, onChange, disabled, compact = false }: ScaleSelectorProps) {
  const [showRubricModal, setShowRubricModal] = useState(false);

  // Get the description for currently selected value
  const selectedDescription = value >= 0 ? scale.rubric[value] : null;

  if (compact) {
    // Compact version for desktop 2-column layout - Professional design
    return (
      <>
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
          {/* Line 1: Scale Name */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h2 className="font-bold text-stone-800 text-base">{scale.title}</h2>
            <button
              onClick={() => setShowRubricModal(true)}
              className="shrink-0 text-xs text-stone-400 hover:text-stone-600 font-medium px-2 py-1 rounded hover:bg-stone-200 transition"
              title="View full rubric"
            >
              View Rubric
            </button>
          </div>
          
          {/* Line 2: Description */}
          <p className="text-stone-500 text-sm mb-4">{scale.description}</p>
          
          {/* Line 3: Score Buttons */}
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => onChange(score)}
                disabled={disabled}
                className={`
                  w-10 h-10 rounded-lg text-sm font-bold transition-all
                  flex items-center justify-center
                  ${value === score 
                    ? 'bg-stone-700 text-white ring-2 ring-stone-700 ring-offset-2' 
                    : 'bg-stone-200 text-stone-600 hover:bg-stone-300 active:bg-stone-400'}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {score}
              </button>
            ))}
            <div className="flex-1" />
            <span className="text-xs text-stone-400">0 = Poor, 5 = Excellent</span>
          </div>

          {/* Line 4: Selected Score Meaning */}
          {selectedDescription && (
            <div className="mt-4 pt-3 border-t border-stone-200">
              <p className="text-sm text-stone-600">
                <span className="font-semibold text-stone-700">Score {value}:</span>{' '}
                {selectedDescription.split('–')[1]?.trim() || selectedDescription}
              </p>
            </div>
          )}
        </div>

        {/* Rubric Modal */}
        {showRubricModal && (
          <RubricModal
            scale={scale}
            value={value}
            onClose={() => setShowRubricModal(false)}
          />
        )}
      </>
    );
  }

  // Full version for mobile
  return (
    <>
      <div className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-stone-100 px-4 py-3 border-b border-stone-200">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-stone-700 text-base sm:text-lg leading-tight">{scale.title}</h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-snug">{scale.description}</p>
            </div>
            <button
              onClick={() => setShowRubricModal(true)}
              className="shrink-0 text-xs sm:text-sm text-stone-600 hover:text-stone-700 font-medium px-2 py-1 rounded bg-stone-200 hover:bg-stone-300 transition"
            >
              ? Rubric
            </button>
          </div>
        </div>

        {/* Score Buttons */}
        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-6 gap-1 sm:gap-2">
            {[0, 1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => onChange(score)}
                disabled={disabled}
                className={`
                  aspect-square sm:aspect-auto sm:py-3 rounded-lg font-bold text-lg sm:text-xl transition-all
                  flex items-center justify-center
                  ${value === score 
                    ? 'bg-stone-600 text-white ring-2 ring-stone-600 ring-offset-2' 
                    : 'bg-stone-200 text-stone-600 hover:bg-stone-300 active:bg-stone-400'}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {score}
              </button>
            ))}
          </div>
          
          {/* Labels */}
          <div className="flex justify-between text-xs text-stone-400 mt-2 px-1">
            <span>Poor</span>
            <span>Excellent</span>
          </div>

          {/* Selected Score Feedback */}
          {selectedDescription && (
            <div className="mt-3 p-3 bg-stone-600 text-white rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-lg">📊</span>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-stone-300">Your Rating: {value}/5</span>
                  <p className="text-sm mt-1 leading-snug">{selectedDescription.split('–')[1]?.trim() || selectedDescription}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rubric Modal */}
      {showRubricModal && (
        <RubricModal
          scale={scale}
          value={value}
          onClose={() => setShowRubricModal(false)}
        />
      )}
    </>
  );
}

// Rubric Modal Component
function RubricModal({ scale, value, onClose }: { scale: ScaleInfo; value: number; onClose: () => void }) {
  return (
    <div 
      className="fixed inset-0 z-50 bg-stone-900/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-stone-50 rounded-xl max-w-lg w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-stone-100 px-4 py-3 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-700 text-lg">{scale.title}</h3>
            <p className="text-xs text-stone-500">{scale.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-700 font-bold text-xl px-2"
          >
            ✕
          </button>
        </div>

        {/* Rubric Items */}
        <div className="p-4">
          <p className="text-xs font-semibold text-stone-500 mb-3 uppercase tracking-wide">Scoring Guide:</p>
          <div className="space-y-2">
            {scale.rubric.map((item, idx) => (
              <div 
                key={idx} 
                className={`text-sm p-3 rounded-lg transition-all ${
                  value === idx 
                    ? 'bg-stone-600 text-white font-medium' 
                    : 'text-stone-600 bg-stone-100 hover:bg-stone-200'
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="sticky bottom-0 bg-stone-50 px-4 py-3 border-t border-stone-200">
          <button
            onClick={onClose}
            className="w-full py-2 bg-stone-600 text-white rounded-lg font-medium hover:bg-stone-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
