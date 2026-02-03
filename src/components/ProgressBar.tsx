interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const remaining = total - current;

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-xl">📊</span>
          <span className="font-semibold text-stone-700 text-sm sm:text-base">Progress</span>
        </div>
        <div className="text-right">
          <span className="text-stone-700 font-bold text-sm sm:text-base">{current}</span>
          <span className="text-stone-400 text-sm sm:text-base"> / {total}</span>
        </div>
      </div>
      
      <div className="w-full bg-stone-200 rounded-full h-3 sm:h-4 overflow-hidden">
        <div 
          className="bg-stone-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center mt-2 text-xs sm:text-sm">
        <span className="text-stone-500">{percentage}% complete</span>
        <span className="text-stone-500">{remaining} remaining</span>
      </div>
    </div>
  );
}
