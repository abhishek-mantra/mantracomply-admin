import React, { useState } from 'react';
import { X, CheckCircle, Clock, ShieldCheck, Mail, Phone, Globe, Building, UserCheck } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { availableSpecialists } from '../data/mockData';

interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any | null;
  onAssignSpecialist?: (id: any, specialist: string) => void;
  onApproveAndAssign?: (id: any, specialist: string) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  isOpen,
  onClose,
  data,
  onAssignSpecialist,
  onApproveAndAssign
}) => {
  if (!isOpen || !data) return null;

  const [selectedSpecialist, setSelectedSpecialist] = useState<string>(
    data.assignedSpecialist || availableSpecialists[0]
  );

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-900">{data.name}</h3>
              <StatusBadge status={data.status} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ID: {data.id} • Registered Date: {data.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Representative Assignment Block - Accessible to Manager/Admin at any stage */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wide">
                <UserCheck size={16} className="text-blue-600" />
                Assigned Representative / Specialist
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                The manager or admin can assign any representative at any stage of credentialing.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSpecialist}
                onChange={(e) => {
                  setSelectedSpecialist(e.target.value);
                  onAssignSpecialist?.(data.id, e.target.value);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {availableSpecialists.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <Mail size={14} /> Email Address
              </div>
              <p className="text-sm font-medium text-slate-800">{data.email || '—'}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <Phone size={14} /> Contact Phone
              </div>
              <p className="text-sm font-medium text-slate-800">{data.phone || '—'}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <Building size={14} /> Organization
              </div>
              <p className="text-sm font-medium text-slate-800">{data.organization || '—'}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <Globe size={14} /> Country / Region
              </div>
              <p className="text-sm font-medium text-slate-800">
                {data.countryFlag} {data.country || '—'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-blue-600" />
              Service & Credentialing Scope
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm mt-3">
              <div>
                <span className="text-xs text-slate-500 block">Requested Service:</span>
                <span className="font-semibold text-slate-800">{data.service}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Current Stage:</span>
                <span className="font-semibold text-slate-800">Primary Source Verification</span>
              </div>
            </div>
          </div>

          {/* Quick activity summary */}
          <div className="border border-slate-100 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock size={15} className="text-slate-500" />
              Recent System Activity
            </h4>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span>Application registered via portal</span>
                <span className="text-slate-400">{data.date}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 font-medium">
                <span>Assigned Representative:</span>
                <span className="text-blue-600 font-semibold">{data.assignedSpecialist || selectedSpecialist}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-xs text-slate-500">
            Current stage: <strong className="text-slate-800">{data.status}</strong>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onApproveAndAssign?.(data.id, selectedSpecialist);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle size={15} /> Save & Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
