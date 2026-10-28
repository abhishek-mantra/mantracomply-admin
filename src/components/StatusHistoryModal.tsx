import React from 'react';
import { X, Clock } from 'lucide-react';

interface StatusHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export const StatusHistoryModal: React.FC<StatusHistoryModalProps> = ({
  isOpen,
  onClose,
  title
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            <h3 className="text-base font-bold text-slate-800">Status History Timeline</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-xs text-slate-500 mb-4 font-medium">Record: <span className="font-semibold text-slate-800">{title}</span></p>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            <div className="relative">
              <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-xs"></div>
              <div className="text-xs font-semibold text-slate-800">Status Changed to Current</div>
              <div className="text-[11px] text-slate-400">Oct 28, 2026 • 09:42 AM by Abhishek Madaan</div>
              <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                Application moved to current review stage. Primary documentation indexed.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-xs"></div>
              <div className="text-xs font-semibold text-slate-800">Additional Information Requested</div>
              <div className="text-[11px] text-slate-400">Oct 27, 2026 • 02:15 PM by System Bot</div>
              <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                Automated email triggered requesting Malpractice Insurance declaration renewal.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-slate-400 border-2 border-white flex items-center justify-center shadow-xs"></div>
              <div className="text-xs font-semibold text-slate-800">Draft Created & Submitted</div>
              <div className="text-[11px] text-slate-400">Oct 26, 2026 • 11:30 AM by Provider</div>
              <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                Provider finished submitting draft credentialing forms through provider onboarding portal.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
