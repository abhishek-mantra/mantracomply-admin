import React, { useState } from 'react';

export const MILESTONE_STAGES = [
  'Pending',
  'In Progress',
  'Request form Submitted',
  'LOI Submitted',
  'Submitted',
  'Network Status Verification',
  'Need Information',
  'Enrolled'
] as const;

export const ALL_PIPELINE_STAGES = [
  ...MILESTONE_STAGES,
  'On Hold',
  'Inactive',
  'Network Close',
  'Not Accepting',
  'Rejected'
] as const;

export type PipelineStage = typeof ALL_PIPELINE_STAGES[number];

interface PipelineStageBarProps {
  status: string;
  onChange: (newStatus: string) => void;
  className?: string;
}

// 8 exact segment colors matching user screenshots (Red, Slate, Green, Blue, Purple, Violet, Pink, Cyan)
const SEGMENT_COLORS = [
  'bg-[#ef4444]', // 1: Red
  'bg-[#64748b]', // 2: Slate Grey
  'bg-[#10b981]', // 3: Emerald Green
  'bg-[#3b82f6]', // 4: Blue
  'bg-[#8b5cf6]', // 5: Purple
  'bg-[#a855f7]', // 6: Violet
  'bg-[#ec4899]', // 7: Pink / Magenta
  'bg-[#06b6d4]', // 8: Cyan / Teal
];

const TOTAL_SEGMENTS = 8;

export const PipelineStageBar: React.FC<PipelineStageBarProps> = ({
  status,
  onChange,
  className = ''
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Normalize legacy status names
  const normalizedStatus = React.useMemo(() => {
    if (status === 'ACTIVE') return 'Enrolled';
    if (status === 'PENDING') return 'Pending';
    if (status === 'SUBMITTED') return 'Submitted';
    return status || 'Pending';
  }, [status]);

  // Determine how many segments to fill (1 to 8)
  const filledCount = React.useMemo(() => {
    switch (normalizedStatus) {
      case 'Pending':
        return 1;
      case 'In Progress':
        return 2;
      case 'Request form Submitted':
        return 3;
      case 'LOI Submitted':
        return 4;
      case 'Submitted':
        return 5;
      case 'Network Status Verification':
        return 6;
      case 'Need Information':
        return 7;
      case 'Enrolled':
        return 8;
      case 'On Hold':
        return 4;
      case 'Inactive':
        return 2;
      case 'Network Close':
      case 'Not Accepting':
        return 3;
      case 'Rejected':
        return 2;
      default: {
        const found = MILESTONE_STAGES.indexOf(normalizedStatus as any);
        return found !== -1 ? found + 1 : 1;
      }
    }
  }, [normalizedStatus]);

  const isTerminalOrHold = ['On Hold', 'Inactive', 'Network Close', 'Not Accepting', 'Rejected'].includes(normalizedStatus);

  return (
    <div className={`relative inline-flex flex-col items-start gap-1 p-0.5 select-none ${className}`}>
      {/* Floating Hover Tooltip (Matching Screenshot 3 pill) */}
      {hoveredIdx !== null && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#0f172a] text-white text-[9px] font-bold rounded-full shadow-lg whitespace-nowrap z-30 pointer-events-none flex items-center gap-1 animate-in fade-in zoom-in-95 duration-100">
          <span>{MILESTONE_STAGES[hoveredIdx]}</span>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0f172a] rotate-45" />
        </div>
      )}

      {/* Segmented Pipeline Bar of 8 boxes (Clicking any box immediately changes the stage - NO DROPDOWN) */}
      <div 
        className="flex items-center gap-[2.5px] p-[2.5px] bg-slate-50/80 border border-slate-200/90 rounded-[4px] shadow-2xs hover:border-slate-300 transition-colors"
        role="group"
        aria-label="Pipeline Stage Progress"
      >
        {Array.from({ length: TOTAL_SEGMENTS }).map((_, idx) => {
          const isFilled = idx < filledCount;
          let barColor = isFilled ? SEGMENT_COLORS[idx] : 'bg-white';

          if (isFilled && isTerminalOrHold) {
            if (normalizedStatus === 'Rejected') {
              barColor = 'bg-rose-600';
            } else if (normalizedStatus === 'On Hold') {
              barColor = 'bg-amber-500';
            } else {
              barColor = 'bg-slate-400';
            }
          }

          const targetStage = MILESTONE_STAGES[idx];

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

      {/* Uppercase Stage Name underneath without any dropdown arrow (matching Screenshot 2 & 3) */}
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap truncate max-w-[180px]">
        {normalizedStatus}
      </div>
    </div>
  );
};
