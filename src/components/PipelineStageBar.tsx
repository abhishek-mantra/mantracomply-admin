import React, { useState } from 'react';

export const PIPELINE_STAGES = [
  'Pending',
  'On Hold',
  'Need Information',
  'In Progress',
  'Request form Submitted',
  'LOI Submitted',
  'Network Status Verification',
  'Network Close/Not Accepting',
  'Submitted',
  'Enrolled',
  'Rejected',
  'Inactive'
] as const;

// Backward-compatibility aliases
export const ALL_PIPELINE_STAGES = PIPELINE_STAGES;
export const MILESTONE_STAGES = PIPELINE_STAGES;

export type PipelineStage = typeof PIPELINE_STAGES[number];

interface PipelineStageBarProps {
  status: string;
  onChange: (newStatus: string) => void;
  className?: string;
}

// 12 distinct progression segment colors matching user screenshots & stage order
export const SEGMENT_COLORS = [
  'bg-[#ef4444]', // 1: Pending (Coral Red)
  'bg-[#f59e0b]', // 2: On Hold (Amber)
  'bg-[#6366f1]', // 3: Need Information (Indigo)
  'bg-[#64748b]', // 4: In Progress (Slate Grey)
  'bg-[#f97316]', // 5: Request form Submitted (Orange)
  'bg-[#0ea5e9]', // 6: LOI Submitted (Sky Blue)
  'bg-[#3b82f6]', // 7: Network Status Verification (Royal Blue)
  'bg-[#d97706]', // 8: Network Close/Not Accepting (Warm Ochre)
  'bg-[#8b5cf6]', // 9: Submitted (Purple)
  'bg-[#10b981]', // 10: Enrolled (Emerald Green)
  'bg-[#e11d48]', // 11: Rejected (Rose Red)
  'bg-[#94a3b8]', // 12: Inactive (Muted Slate)
];

export const TOTAL_SEGMENTS = 12;

export function normalizePipelineStatus(raw: string): string {
  if (!raw) return 'Pending';
  const trimmed = raw.trim();
  if (trimmed === 'ACTIVE') return 'Enrolled';
  if (trimmed === 'PENDING') return 'Pending';
  if (trimmed === 'SUBMITTED') return 'Submitted';
  if (trimmed === 'Network Close' || trimmed === 'Not Accepting') return 'Network Close/Not Accepting';

  const match = PIPELINE_STAGES.find(s => s.toLowerCase() === trimmed.toLowerCase());
  return match || trimmed;
}

export const PipelineStageBar: React.FC<PipelineStageBarProps> = ({
  status,
  onChange,
  className = ''
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Normalize legacy and incoming status names
  const normalizedStatus = React.useMemo(() => {
    return normalizePipelineStatus(status);
  }, [status]);

  // Determine how many segments to fill (1 to 12)
  const filledCount = React.useMemo(() => {
    const foundIdx = PIPELINE_STAGES.findIndex(
      (s) => s.toLowerCase() === normalizedStatus.toLowerCase()
    );
    return foundIdx !== -1 ? foundIdx + 1 : 1;
  }, [normalizedStatus]);

  return (
    <div className={`relative inline-flex flex-col items-start gap-1 p-0.5 select-none ${className}`}>
      {/* Floating Hover Tooltip showing exact stage on hover */}
      {hoveredIdx !== null && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#0f172a] text-white text-[9px] font-bold rounded-full shadow-lg whitespace-nowrap z-30 pointer-events-none flex items-center gap-1 animate-in fade-in zoom-in-95 duration-100">
          <span>{PIPELINE_STAGES[hoveredIdx]}</span>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0f172a] rotate-45" />
        </div>
      )}

      {/* Segmented Pipeline Bar of 12 boxes (Clicking any box immediately changes the stage - NO DROPDOWN) */}
      <div 
        className="flex items-center gap-[2.5px] p-[2.5px] bg-slate-50/80 border border-slate-200/90 rounded-[4px] shadow-2xs hover:border-slate-300 transition-colors"
        role="group"
        aria-label="Pipeline Stage Progress"
      >
        {Array.from({ length: TOTAL_SEGMENTS }).map((_, idx) => {
          const isFilled = idx < filledCount;
          const barColor = isFilled ? SEGMENT_COLORS[idx] : 'bg-white';
          const targetStage = PIPELINE_STAGES[idx];

          return (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(targetStage);
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`w-3.5 h-2.5 rounded-[2px] transition-all cursor-pointer focus:outline-none ${barColor} ${
                !isFilled 
                  ? 'border border-slate-200 hover:border-slate-400 hover:bg-slate-100' 
                  : 'hover:brightness-110 hover:shadow-xs'
              }`}
              title={`Click to set stage to: ${targetStage}`}
              aria-label={targetStage}
            />
          );
        })}
      </div>

      {/* Uppercase Stage Name underneath without any dropdown arrow */}
      <div 
        className="text-[10px] font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap truncate max-w-[210px]"
        title={normalizedStatus}
      >
        {normalizedStatus}
      </div>
    </div>
  );
};
