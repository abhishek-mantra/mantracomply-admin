import React from 'react';
import { X, FileText, CheckCircle2, XCircle, Download, ExternalLink } from 'lucide-react';
import { StatusBadge, StatusType } from './StatusBadge';
import { DocumentRecord } from '../data/mockData';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentRecord | null;
  onUpdateStatus: (id: string, newStatus: StatusType) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document,
  onUpdateStatus
}) => {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">{document.documentName}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{document.documentType}</span>
                <span>•</span>
                <span>Uploaded: {document.uploadDate}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge
              status={document.status}
              interactive={true}
              onChange={(s) => onUpdateStatus(document.id, s)}
            />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50 flex flex-col items-center justify-center min-h-[380px]">
          {/* Simulated PDF document viewer */}
          <div className="w-full max-w-xl bg-white rounded-xl shadow-md border border-slate-200 p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <FileText size={32} />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">{document.documentName}</h4>
              <p className="text-xs text-slate-400 mt-1">Provider: <span className="font-semibold text-slate-700">{document.userName}</span></p>
              <p className="text-xs text-slate-400">Validity: <span className="font-semibold text-slate-700">{document.expiryDate}</span></p>
            </div>

            <div className="py-6 px-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs text-slate-500 leading-relaxed">
              [Document Verification Preview Sandbox]<br />
              This document was submitted as a certified {document.documentType} compliant with MantraComply state board and payer enrollment verification requirements.
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button 
                onClick={() => alert(`Downloading ${document.documentName}...`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Download size={14} /> Download File
              </button>
              <button 
                onClick={() => alert(`Opening in external window`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ExternalLink size={14} /> Open in New Tab
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Current status: <strong className="text-slate-800">{document.status}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onUpdateStatus(document.id, 'UNVERIFIED');
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              <XCircle size={15} /> Mark Unverified
            </button>
            <button
              onClick={() => {
                onUpdateStatus(document.id, 'VERIFIED');
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <CheckCircle2 size={15} /> Approve & Verify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
