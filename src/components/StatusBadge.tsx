import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export type StatusType = 
  | 'DRAFT' 
  | 'PENDING' 
  | 'ACTIVE' 
  | 'APPROVED' 
  | 'VERIFIED' 
  | 'SUBMITTED' 
  | 'RESUBMITTED' 
  | 'UNDER REVIEW' 
  | 'NEEDS INFO' 
  | 'REJECTED' 
  | 'UNVERIFIED';

interface StatusBadgeProps {
  status: StatusType;
  interactive?: boolean;
  options?: StatusType[];
  onChange?: (newStatus: StatusType) => void;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  interactive = false,
  options = ['PENDING', 'VERIFIED', 'UNVERIFIED', 'RESUBMITTED'],
  onChange
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStyle = (st: StatusType) => {
    switch (st) {
      case 'ACTIVE':
      case 'APPROVED':
      case 'VERIFIED':
        return 'bg-[#DCFCE7] text-[#16A34A] border-[#86EFAC] hover:bg-[#c9f9d9]';
      case 'PENDING':
      case 'UNDER REVIEW':
      case 'NEEDS INFO':
        return 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A] hover:bg-[#fde8a1]';
      case 'SUBMITTED':
        return 'bg-[#DBEAFE] text-[#2563EB] border-[#93C5FD] hover:bg-[#c7e0fd]';
      case 'RESUBMITTED':
        return 'bg-[#EDE9FE] text-[#7C3AED] border-[#DDD6FE] hover:bg-[#ded5fd]';
      case 'REJECTED':
      case 'UNVERIFIED':
        return 'bg-[#FFE4E6] text-[#E11D48] border-[#FECDD3] hover:bg-[#fecdd3]';
      case 'DRAFT':
      default:
        return 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1] hover:bg-[#e2e8f0]';
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        disabled={!interactive}
        onClick={() => interactive && setOpen(!open)}
        className={`inline-flex items-center justify-between gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border transition-all ${getStyle(
          status
        )} ${interactive ? 'cursor-pointer min-w-[110px]' : 'cursor-default'}`}
      >
        <span>{status}</span>
        {interactive && <ChevronDown size={13} className="opacity-70" />}
      </button>

      {interactive && open && (
        <div className="absolute right-0 mt-1 w-36 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] shadow-xl py-1 z-50 text-center font-semibold text-xs tracking-wide overflow-hidden">
          {options.map((option) => {
            const isSelected = option === status;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange?.(option);
                  setOpen(false);
                }}
                className={`w-full py-1.5 px-2 transition-colors ${
                  isSelected
                    ? 'bg-[#2563EB] text-white'
                    : 'text-[#6D28D9] hover:bg-[#EDE9FE]'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

