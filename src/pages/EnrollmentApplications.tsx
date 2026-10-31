import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Users, 
  Building2, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Shield,
  UserCheck,
  Plus,
  X,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { availableSpecialists, enrollmentStatusOptions } from '../data/mockData';

// Interactive Priority Dropdown Badge Component
const PriorityBadge: React.FC<{
  priority: string;
  onChange: (newPriority: 'High' | 'Medium' | 'Low') => void;
}> = ({ priority, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStyle = (p: string) => {
    switch (p) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
      case 'Low':
      case 'Standard':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
    }
  };

  const options: Array<'High' | 'Medium' | 'Low'> = ['High', 'Medium', 'Low'];
  const displayLabel = priority === 'Standard' ? 'Low' : (priority || 'Low');

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center justify-between gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer min-w-[82px] shadow-2xs ${getStyle(
          priority
        )}`}
        title="Click to change priority"
      >
        <span>{displayLabel}</span>
        <ChevronDown size={11} className="opacity-70" />
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-28 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-50 text-center font-semibold text-xs tracking-wide overflow-hidden animate-in fade-in duration-150">
          {options.map((option) => {
            const isSelected = (priority === 'Standard' && option === 'Low') || priority === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`w-full py-1.5 px-3 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{option}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Interactive Enrollment Status Dropdown Badge Component
const EnrollmentStatusBadge: React.FC<{
  status: string;
  onChange: (newStatus: string) => void;
}> = ({ status, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedStatus = useMemo(() => {
    if (status === 'ACTIVE') return 'Enrolled';
    if (status === 'PENDING') return 'Pending';
    if (status === 'SUBMITTED') return 'Submitted';
    return status || 'Pending';
  }, [status]);

  const getStyle = (s: string) => {
    switch (s) {
      case 'Enrolled':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      case 'Submitted':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100';
      case 'Request form Submitted':
        return 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100';
      case 'LOI Submitted':
        return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100';
      case 'Network Status Verification':
        return 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100';
      case 'Need Information':
        return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100';
      case 'Inactive':
        return 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200';
      case 'Network Close':
        return 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200';
      case 'On Hold':
        return 'bg-yellow-50 text-yellow-800 border-yellow-300 hover:bg-yellow-100';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100';
      case 'Not Accepting':
        return 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
    }
  };

  const getDotColor = (s: string) => {
    switch (s) {
      case 'Enrolled':
        return 'bg-emerald-500';
      case 'Pending':
        return 'bg-amber-500';
      case 'In Progress':
        return 'bg-blue-500';
      case 'Submitted':
        return 'bg-indigo-500';
      case 'Request form Submitted':
        return 'bg-sky-500';
      case 'LOI Submitted':
        return 'bg-purple-500';
      case 'Network Status Verification':
        return 'bg-teal-500';
      case 'Need Information':
        return 'bg-orange-500';
      case 'Inactive':
        return 'bg-slate-400';
      case 'Network Close':
        return 'bg-zinc-500';
      case 'On Hold':
        return 'bg-yellow-500';
      case 'Rejected':
        return 'bg-rose-500';
      case 'Not Accepting':
        return 'bg-red-600';
      default:
        return 'bg-slate-400';
    }
  };

  const options = [
    'Pending',
    'In Progress',
    'Submitted',
    'Request form Submitted',
    'LOI Submitted',
    'Network Status Verification',
    'Need Information',
    'Enrolled',
    'Inactive',
    'Network Close',
    'On Hold',
    'Rejected',
    'Not Accepting'
  ];

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center justify-between gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border transition-all cursor-pointer min-w-[120px] shadow-2xs whitespace-nowrap ${getStyle(
          normalizedStatus
        )}`}
        title="Click to change status"
      >
        <span className="flex items-center gap-1.5 truncate max-w-[150px]">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDotColor(normalizedStatus)}`} />
          <span className="truncate">{normalizedStatus}</span>
        </span>
        <ChevronDown size={11} className="opacity-70 shrink-0 ml-1" />
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-64 rounded-xl bg-white border border-slate-200 shadow-2xl py-1.5 z-50 font-semibold text-xs tracking-wide overflow-hidden max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 tracking-wider">
            Select Status
          </div>
          {options.map((option) => {
            const isSelected = normalizedStatus === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`w-full py-2 px-3 flex items-center justify-between text-xs transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${getDotColor(option)}`} />
                  <span className="truncate">{option}</span>
                </div>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const EnrollmentApplications: React.FC = () => {
  const {
    enrollments,
    addEnrollment,
    updateEnrollmentStatus,
    assignEnrollmentSpecialist,
    updateEnrollmentDetails,
    providers,
    currentPersona,
    isAdmin,
    isSpecialist,
    isAssignedOnly
  } = useApp();

  const [activeToggle, setActiveToggle] = useState<'providers' | 'facilities'>('providers');
  const [searchTerm, setSearchTerm] = useState('');
  const [specialistFilter, setSpecialistFilter] = useState<string>('ALL');

  // Filter ONLY providers who have been credentialized (Status === APPROVED in Credential Applications tab)
  const approvedProviders = useMemo(() => {
    return providers.filter(p => p.status === 'APPROVED');
  }, [providers]);

  // Modal State for Add Enrollment Request
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [payer, setPayer] = useState('Aetna');
  const [customPayer, setCustomPayer] = useState('');
  const [payerType, setPayerType] = useState('Commercial');
  const [stateName, setStateName] = useState('FL');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [modalStatus, setModalStatus] = useState<string>('Pending');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [dateOfSubmission, setDateOfSubmission] = useState('Oct 31, 2026');
  const [followUpDate, setFollowUpDate] = useState('Nov 14, 2026');
  const [responsibleUser, setResponsibleUser] = useState(availableSpecialists[0]);
  const [providerInsuranceId, setProviderInsuranceId] = useState('');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    if (approvedProviders.length > 0) {
      const first = approvedProviders[0];
      setSelectedProviderId(first.id.toString());
      setStateName(first.country === 'United States' ? 'FL' : 'UK - National');
      setResponsibleUser(first.assignedSpecialist || availableSpecialists[0]);
    } else {
      setSelectedProviderId('');
    }
    setReferenceNumber(`REF-${Math.floor(10000 + Math.random() * 90000)}`);
    setProviderInsuranceId(`INS-${Math.floor(100000 + Math.random() * 900000)}`);
    setDateOfSubmission(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    setFollowUpDate(futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    
    setNotes('');
    setCustomPayer('');
    setModalStatus('Pending');
    setIsAddModalOpen(true);
  };

  const handleProviderSelect = (provId: string) => {
    setSelectedProviderId(provId);
    const prov = approvedProviders.find(p => p.id.toString() === provId);
    if (prov) {
      if (prov.assignedSpecialist) {
        setResponsibleUser(prov.assignedSpecialist);
      }
      setStateName(prov.country === 'United States' ? 'FL' : 'UK - National');
    }
  };

  const handleCreateEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProvider = approvedProviders.find(p => p.id.toString() === selectedProviderId);
    if (!selectedProvider) return;

    const finalPayer = payer === 'OTHER' ? (customPayer.trim() || 'Custom Payer') : payer;
    const finalRef = referenceNumber.trim() || `REF-${Math.floor(10000 + Math.random() * 90000)}`;

    addEnrollment({
      providerName: selectedProvider.name,
      organization: selectedProvider.organization,
      service: selectedProvider.service,
      state: stateName || 'FL',
      type: payerType,
      payer: finalPayer,
      priority: priority,
      status: modalStatus || 'Pending',
      dateOfSubmission: dateOfSubmission || 'Oct 31, 2026',
      referenceNumber: finalRef,
      followUpDate: followUpDate || 'Nov 14, 2026',
      responsibleUser: responsibleUser,
      effectiveDate: 'Pending',
      recredentialingDate: '—',
      providerInsuranceId: providerInsuranceId.trim() || `INS-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: notes.trim() || 'Submitted by Ops team; pending payer portal verification'
    });

    setIsAddModalOpen(false);
  };

  const selectedProviderObject = useMemo(() => {
    return approvedProviders.find(p => p.id.toString() === selectedProviderId);
  }, [approvedProviders, selectedProviderId]);

  // Filtered Enrollments with Data Isolation logic & comprehensive multi-field search
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(item => {
      // Specialist Data Isolation Rule:
      // If logged in as an assigned-only specialist, they ONLY see requests assigned to them
      const assigned = item.responsibleUser || item.assignedSpecialist;
      if (isAssignedOnly && assigned !== currentPersona.name) {
        return false;
      }

      // Admin specialist filter
      if (isAdmin && specialistFilter !== 'ALL' && assigned !== specialistFilter) {
        return false;
      }

      const q = searchTerm.toLowerCase();
      const matchSearch = searchTerm === '' ||
        item.providerName.toLowerCase().includes(q) ||
        item.organization.toLowerCase().includes(q) ||
        item.service.toLowerCase().includes(q) ||
        (item.state || '').toLowerCase().includes(q) ||
        (item.type || '').toLowerCase().includes(q) ||
        (item.payer || item.insurance || '').toLowerCase().includes(q) ||
        (item.priority || '').toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        (item.referenceNumber || '').toLowerCase().includes(q) ||
        (item.providerInsuranceId || '').toLowerCase().includes(q) ||
        (item.responsibleUser || item.assignedSpecialist || '').toLowerCase().includes(q) ||
        (item.notes || '').toLowerCase().includes(q);
      
      return matchSearch;
    });
  }, [enrollments, searchTerm, specialistFilter, isSpecialist, isAdmin, currentPersona.name]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Enrollment Applications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and track insurance enrollment requests for providers and facilities across all contracting milestones.
          </p>
        </div>

        {/* Header Actions: Toggle Buttons & + New Enrollment Request Button */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          {/* Toggle Buttons: Providers / Facilities */}
          <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-xs">
            <button
              onClick={() => setActiveToggle('providers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeToggle === 'providers'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={16} />
              Providers
            </button>
            <button
              onClick={() => setActiveToggle('facilities')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeToggle === 'facilities'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 size={16} />
              Facilities
            </button>
          </div>

          {/* New Enrollment Request Button for Ops Team */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>New Enrollment Request</span>
          </button>
        </div>
      </div>

      {/* Role-based Data Scope Notice Banner */}
      {isSpecialist ? (
        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2 font-medium">
            <UserCheck size={16} className="text-emerald-600 shrink-0" />
            <span>
              <strong>Specialist View Mode:</strong> You are logged in as <strong>{currentPersona.name}</strong>. Only insurance enrollments assigned specifically to you are visible. Other specialists' workloads are restricted.
            </span>
          </div>
          <span className="font-bold text-[10px] tracking-wide uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
            Assigned Only Scope
          </span>
        </div>
      ) : (
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-950">
          <div className="flex items-center gap-2 font-medium">
            <Shield size={16} className="text-blue-600 shrink-0" />
            <span>
              <strong>Admin Access Active:</strong> You can see all insurance enrollment requests made by all credentialing specialists across the entire organization.
            </span>
          </div>
          <span className="font-bold text-[10px] tracking-wide uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-300">
            Global View Scope
          </span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Search size={18} className="text-slate-400 shrink-0" />
          
          <button className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 text-xs font-semibold text-blue-600 shrink-0 cursor-pointer flex items-center gap-1.5">
            All requests
            <ChevronDown size={13} />
          </button>

          {/* Admin Specialist Filter Dropdown */}
          {isAdmin && (
            <div className="relative">
              <select
                value={specialistFilter}
                onChange={(e) => setSpecialistFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none appearance-none pr-7"
              >
                <option value="ALL">All Specialists</option>
                {availableSpecialists.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={13} className="text-slate-500 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          )}

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search provider, org, payer, ref #, insurance ID, or notes..."
            className="w-full text-sm text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500 whitespace-nowrap pl-4 border-l border-slate-100 hidden md:flex items-center gap-2">
          <span>{filteredEnrollments.length} records</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400 font-normal">Scroll horizontally to view all columns ⇄</span>
        </div>
      </div>

      {/* Scrollable Rows Table with all 16 Columns */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[2100px]">
            <thead>
              <tr className="bg-[#002B49] text-white text-[11px] font-bold uppercase tracking-wider">
                {/* 1. Provider Name (Sticky Left Column) */}
                <th className="py-3.5 px-4 sticky left-0 bg-[#002B49] z-20 shadow-[2px_0_4px_rgba(0,0,0,0.18)] min-w-[200px] border-r border-[#1a4a6e]">
                  Provider Name
                </th>
                {/* 2. Organization */}
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[140px] border-r border-[#1a4a6e]">
                  Organization
                </th>
                {/* 3. Service */}
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px] border-r border-[#1a4a6e]">
                  Service
                </th>
                {/* 4. State */}
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px] border-r border-[#1a4a6e]">
                  State
                </th>
                {/* 5. Type */}
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[120px] border-r border-[#1a4a6e]">
                  Type
                </th>
                {/* 6. Payer */}
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[140px] border-r border-[#1a4a6e]">
                  Payer
                </th>
                {/* 7. Priority */}
                <th className="py-3.5 px-4 whitespace-nowrap text-center min-w-[100px] border-r border-[#1a4a6e]">
                  Priority
                </th>
                {/* 8. Status */}
                <th className="py-3.5 px-4 whitespace-nowrap text-center min-w-[120px] border-r border-[#1a4a6e]">
                  Status
                </th>
                {/* 9. Date of Submission */}
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[150px] border-r border-[#1a4a6e]">
                  Date of Submission
                </th>
                {/* 10. Reference Number */}
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[150px] border-r border-[#1a4a6e]">
                  Reference Number
                </th>
                {/* 11. Follow Up Date */}
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px] border-r border-[#1a4a6e]">
                  Follow Up Date
                </th>
                {/* 12. Responsible User */}
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[170px] border-r border-[#1a4a6e]">
                  Responsible User
                </th>
                {/* 13. Effective Date */}
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px] border-r border-[#1a4a6e]">
                  Effective Date
                </th>
                {/* 14. Recredentialing Date */}
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[150px] border-r border-[#1a4a6e]">
                  Recredentialing Date
                </th>
                {/* 15. Provider Insurance ID */}
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[170px] border-r border-[#1a4a6e]">
                  Provider Insurance ID
                </th>
                {/* 16. Notes */}
                <th className="py-3.5 px-4 min-w-[320px]">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={16} className="text-center py-16 text-slate-400 text-sm">
                    {isSpecialist 
                      ? `No enrollment requests currently assigned to ${currentPersona.name}.`
                      : `No enrollment requests found matching your filters.`}
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* 1. Provider Name (Sticky Left Column) */}
                    <td className="py-3 px-4 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-10 shadow-[2px_0_4px_rgba(0,0,0,0.06)] border-r border-slate-100">
                      <div className="font-semibold text-slate-900 whitespace-nowrap">
                        {item.providerName}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        ID: #{item.id}
                      </div>
                    </td>

                    {/* 2. Organization */}
                    <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                      {item.organization}
                    </td>

                    {/* 3. Service */}
                    <td className="py-3 px-4 text-blue-700 font-semibold uppercase whitespace-nowrap">
                      {item.service}
                    </td>

                    {/* 4. State */}
                    <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                      {item.state || '—'}
                    </td>

                    {/* 5. Type */}
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {item.type || 'Commercial'}
                    </td>

                    {/* 6. Payer */}
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {item.payer || item.insurance}
                    </td>

                    {/* 7. Priority (Interactive Dropdown Badge) */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <PriorityBadge 
                        priority={item.priority || 'Low'} 
                        onChange={(newPriority) => {
                          updateEnrollmentDetails(item.id, { priority: newPriority });
                        }}
                      />
                    </td>

                    {/* 8. Status (Interactive Dropdown with 13 Healthcare Workflow Options) */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <EnrollmentStatusBadge
                        status={item.status}
                        onChange={(newStatus) => {
                          updateEnrollmentStatus(item.id, newStatus);
                        }}
                      />
                    </td>

                    {/* 9. Date of Submission */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-medium">
                      {item.dateOfSubmission || item.date || '—'}
                    </td>

                    {/* 10. Reference Number */}
                    <td className="py-3 px-4 text-slate-800 font-mono text-[11px] whitespace-nowrap">
                      {item.referenceNumber ? (
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                          {item.referenceNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* 11. Follow Up Date */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-medium">
                      {item.followUpDate || '—'}
                    </td>

                    {/* 12. Responsible User (Assigned Specialist Dropdown) */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isAdmin ? (
                        <div className="relative inline-block">
                          <select
                            value={item.responsibleUser || item.assignedSpecialist || availableSpecialists[0]}
                            onChange={(e) => assignEnrollmentSpecialist(item.id, e.target.value)}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer appearance-none pr-6 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {availableSpecialists.map((specialist) => (
                              <option key={specialist} value={specialist}>
                                {specialist}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={12} className="text-slate-400 absolute right-2 top-2 pointer-events-none" />
                        </div>
                      ) : (
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {item.responsibleUser || item.assignedSpecialist}
                        </span>
                      )}
                    </td>

                    {/* 13. Effective Date */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.effectiveDate && item.effectiveDate !== 'Pending' ? (
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {item.effectiveDate}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* 14. Recredentialing Date */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-medium">
                      {item.recredentialingDate || '—'}
                    </td>

                    {/* 15. Provider Insurance ID */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                      {item.providerInsuranceId ? (
                        <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200">
                          {item.providerInsuranceId}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* 16. Notes */}
                    <td 
                      className="py-3 px-4 text-slate-600 min-w-[320px] max-w-[420px] truncate" 
                      title={item.notes}
                    >
                      {item.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-white text-xs">
          <div className="flex items-center gap-6 text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <span className="uppercase text-[11px] font-semibold text-slate-400">Rows per page</span>
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-2 py-1 bg-white font-semibold text-slate-700">
                <span>10</span>
                <ChevronDown size={13} className="text-slate-400" />
              </div>
            </div>
            <div>
              Showing <span className="font-semibold text-slate-700">1-{filteredEnrollments.length}</span> of {enrollments.length}
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-500 font-medium">
            <span className="uppercase text-[11px] font-semibold tracking-wider text-slate-400">
              Page 1 / 1
            </span>
            <div className="flex items-center gap-1">
              <button disabled className="p-1 rounded text-slate-300 cursor-not-allowed">
                <ChevronsLeft size={16} />
              </button>
              <button disabled className="p-1 rounded text-slate-300 cursor-not-allowed">
                <ChevronLeft size={16} />
              </button>
              <button disabled className="p-1 rounded text-slate-300 cursor-not-allowed">
                <ChevronRight size={16} />
              </button>
              <button disabled className="p-1 rounded text-slate-300 cursor-not-allowed">
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add New Enrollment Request for Credentialed Providers */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setIsAddModalOpen(false)}
            />

            {/* Modal Dialog Box */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-hidden flex flex-col transform transition-all z-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                    New Enrollment Request
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select an approved credentialed provider to initiate payer enrollment.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Form Content */}
              <form onSubmit={handleCreateEnrollment} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                {approvedProviders.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs">No Credentialed Providers Available</p>
                      <p className="text-xs text-amber-800 mt-1">
                        Only providers who have been marked as <strong>APPROVED</strong> in the Credential Applications tab are eligible for payer enrollment. Please review and approve provider applications before creating enrollment requests.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Provider Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Select Credentialed Provider <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={selectedProviderId}
                          onChange={(e) => handleProviderSelect(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer appearance-none pr-9"
                          required
                        >
                          {approvedProviders.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — {p.service} ({p.organization}, {p.country})
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Only providers with status APPROVED in the Credential Applications tab appear here.
                      </p>
                    </div>

                    {/* Selected Provider Info Pill */}
                    {selectedProviderObject && (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="text-emerald-600 shrink-0" size={16} />
                          <span>
                            <strong>{selectedProviderObject.name}</strong> • Org: <strong>{selectedProviderObject.organization}</strong> • Service: <strong>{selectedProviderObject.service}</strong>
                          </span>
                        </div>
                        <span className="font-bold text-[10px] tracking-wide uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                          Credentialed
                        </span>
                      </div>
                    )}

                    {/* Payer and Plan Type (2 columns) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Payer / Insurance <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={payer}
                            onChange={(e) => setPayer(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer appearance-none pr-8"
                          >
                            <option value="Aetna">Aetna</option>
                            <option value="Blue Cross Blue Shield">Blue Cross Blue Shield</option>
                            <option value="Cigna">Cigna</option>
                            <option value="UnitedHealthcare">UnitedHealthcare</option>
                            <option value="Humana">Humana</option>
                            <option value="Medicare">Medicare</option>
                            <option value="Medicaid">Medicaid</option>
                            <option value="Bupa">Bupa</option>
                            <option value="Vitality">Vitality</option>
                            <option value="AXA Health">AXA Health</option>
                            <option value="WPA">WPA</option>
                            <option value="Aviva">Aviva</option>
                            <option value="OTHER">Other / Custom Payer</option>
                          </select>
                          <ChevronDown size={14} className="text-slate-400 absolute right-3 top-3 pointer-events-none" />
                        </div>
                        {payer === 'OTHER' && (
                          <input
                            type="text"
                            placeholder="Enter custom payer name"
                            value={customPayer}
                            onChange={(e) => setCustomPayer(e.target.value)}
                            className="w-full mt-2 px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500"
                            required
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Type <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={payerType}
                            onChange={(e) => setPayerType(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer appearance-none pr-8"
                          >
                            <option value="Commercial">Commercial</option>
                            <option value="Medicare">Medicare</option>
                            <option value="Medicaid">Medicaid</option>
                            <option value="Managed Care">Managed Care</option>
                            <option value="TriCare">TriCare</option>
                            <option value="Private Insurance">Private Insurance</option>
                          </select>
                          <ChevronDown size={14} className="text-slate-400 absolute right-3 top-3 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* State / Jurisdiction */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        State / Jurisdiction <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        placeholder="e.g. FL, NY, CA, TX, UK - National"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Status and Priority (2 columns) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Initial Status <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={modalStatus}
                            onChange={(e) => setModalStatus(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer appearance-none pr-8 font-semibold"
                          >
                            {enrollmentStatusOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="text-slate-400 absolute right-3 top-3 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Priority <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as 'High' | 'Medium' | 'Low')}
                            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer appearance-none pr-8 font-semibold"
                          >
                            <option value="High">High Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="Low">Low Priority</option>
                          </select>
                          <ChevronDown size={14} className="text-slate-400 absolute right-3 top-3 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Reference Number and Follow Up Date (2 columns) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Reference Number
                        </label>
                        <input
                          type="text"
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                          placeholder="e.g. REF-84920"
                          className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-slate-700"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Follow Up Date
                        </label>
                        <input
                          type="text"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          placeholder="e.g. Nov 14, 2026"
                          className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Responsible Specialist and Provider Insurance ID (2 columns) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Responsible Specialist <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={responsibleUser}
                            onChange={(e) => setResponsibleUser(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer appearance-none pr-8"
                          >
                            {availableSpecialists.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="text-slate-400 absolute right-3 top-3 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Provider Insurance ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={providerInsuranceId}
                          onChange={(e) => setProviderInsuranceId(e.target.value)}
                          placeholder="e.g. INS-928371"
                          className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Notes & Contracting Route */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Notes & Contracting Route
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Submitted via Availity portal. Roster review pending."
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                      />
                    </div>
                  </>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  {approvedProviders.length > 0 && (
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      Submit Enrollment Request
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
