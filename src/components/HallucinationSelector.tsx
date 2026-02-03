import { useState } from 'react';

interface HallucinationSelectorProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  compact?: boolean;
}

export default function HallucinationSelector({ value, onChange, disabled, compact = false }: HallucinationSelectorProps) {
  const [showInfoModal, setShowInfoModal] = useState(false);

  if (compact) {
    // Compact version for desktop 2-column layout - Professional design
    return (
      <>
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
          {/* Line 1: Title */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h2 className="font-bold text-stone-800 text-base">Hallucination Detection</h2>
            <button
              onClick={() => setShowInfoModal(true)}
              className="shrink-0 text-xs text-stone-400 hover:text-stone-600 font-medium px-2 py-1 rounded hover:bg-stone-200 transition"
              title="What is hallucination?"
            >
              Learn More
            </button>
          </div>
          
          {/* Line 2: Description */}
          <p className="text-stone-500 text-sm mb-4">Does the image contain culturally incorrect or foreign elements?</p>
          
          {/* Line 3: Selection Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onChange(true)}
              disabled={disabled}
              className={`
                px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2
                ${value === true 
                  ? 'bg-red-500 text-white ring-2 ring-red-500 ring-offset-2' 
                  : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span>⚠️</span>
              <span>Yes, has issues</span>
            </button>
            
            <button
              onClick={() => onChange(false)}
              disabled={disabled}
              className={`
                px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2
                ${value === false 
                  ? 'bg-green-500 text-white ring-2 ring-green-500 ring-offset-2' 
                  : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span>✓</span>
              <span>No, looks authentic</span>
            </button>
          </div>

          {/* Line 4: Selection Feedback */}
          {value !== null && (
            <div className="mt-4 pt-3 border-t border-stone-200">
              <p className="text-sm text-stone-600">
                <span className="font-semibold text-stone-700">Your assessment:</span>{' '}
                {value 
                  ? 'Image contains hallucinated or culturally foreign elements' 
                  : 'Image appears culturally authentic to Bangladesh'}
              </p>
            </div>
          )}
        </div>

        {/* Info Modal */}
        {showInfoModal && (
          <HallucinationInfoModal onClose={() => setShowInfoModal(false)} />
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
              <h3 className="font-bold text-stone-700 text-base sm:text-lg leading-tight">Hallucination Detection</h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-snug">
                Contains culturally incorrect or foreign elements?
              </p>
            </div>
            <button
              onClick={() => setShowInfoModal(true)}
              className="shrink-0 text-xs sm:text-sm text-stone-600 hover:text-stone-700 font-medium px-2 py-1 rounded bg-stone-200 hover:bg-stone-300 transition"
            >
              ? Help
            </button>
          </div>
        </div>

        {/* Selection Buttons */}
        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onChange(true)}
              disabled={disabled}
              className={`
                p-4 sm:p-5 rounded-xl font-bold transition-all flex flex-col items-center gap-2
                ${value === true 
                  ? 'bg-red-400 text-white ring-2 ring-red-400 ring-offset-2' 
                  : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className="text-2xl sm:text-3xl">⚠️</span>
              <span className="text-sm sm:text-base">YES</span>
              <span className="text-xs font-normal opacity-80">Has Issues</span>
            </button>
            
            <button
              onClick={() => onChange(false)}
              disabled={disabled}
              className={`
                p-4 sm:p-5 rounded-xl font-bold transition-all flex flex-col items-center gap-2
                ${value === false 
                  ? 'bg-green-500 text-white ring-2 ring-green-500 ring-offset-2' 
                  : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className="text-2xl sm:text-3xl">✓</span>
              <span className="text-sm sm:text-base">NO</span>
              <span className="text-xs font-normal opacity-80">Looks Authentic</span>
            </button>
          </div>

          {/* Selection Feedback */}
          {value !== null && (
            <div className={`mt-3 p-3 rounded-lg ${value ? 'bg-red-400' : 'bg-green-500'} text-white`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{value ? '⚠️' : '✓'}</span>
                <span className="text-sm font-medium">
                  {value 
                    ? 'Marked as containing hallucinated/foreign elements' 
                    : 'Marked as culturally authentic'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <HallucinationInfoModal onClose={() => setShowInfoModal(false)} />
      )}
    </>
  );
}

// Hallucination Info Modal
function HallucinationInfoModal({ onClose }: { onClose: () => void }) {
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
          <h3 className="font-bold text-stone-700 text-lg">Hallucination Detection</h3>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-700 font-bold text-xl px-2"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs font-semibold text-stone-500 mb-3 uppercase tracking-wide">What to Look For:</p>
          <ul className="text-sm text-stone-600 space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-red-400">⚠️</span>
              <span>Foreign cultural elements (non-Bangladeshi clothing, architecture, symbols)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">⚠️</span>
              <span>Anachronistic objects (modern items in traditional scenes)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">⚠️</span>
              <span>Geographically incorrect elements (wrong landscape, flora, fauna)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">⚠️</span>
              <span>Incorrect or gibberish Bengali text/script</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">⚠️</span>
              <span>Culturally inappropriate combinations</span>
            </li>
          </ul>
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
