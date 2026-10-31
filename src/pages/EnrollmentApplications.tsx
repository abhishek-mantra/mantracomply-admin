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
  Plus, 
  X, 
  AlertCircle,
  Settings,
  GripVertical,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { availableSpecialists, EnrollmentRecord } from '../data/mockData';
import { PipelineStageBar } from '../components/PipelineStageBar';
import { ClientDetailDrawer } from '../components/ClientDetailDrawer';

export interface ColumnDef {
  id: string;
  label: string;
  visible: boolean;
  minWidth?: string;
  isSticky?: boolean;
}

const DEFAULT_COLUMNS: ColumnDef[] = [
  { id: 'providerName', label: 'Provider Name', visible: true, minWidth: '200px' },
  { id: 'organization', label: 'Organization', visible: true, minWidth: '140px' },
  { id: 'service', label: 'Service', visible: true, minWidth: '130px' },
  { id: 'state', label: 'State', visible: true, minWidth: '120px' },
  { id: 'type', label: 'Type', visible: true, minWidth: '120px' },
  { id: 'payer', label: 'Payer', visible: true, minWidth: '140px' },
  { id: 'priority', label: 'Priority', visible: true, minWidth: '110px' },
  { id: 'stage', label: 'Stage', visible: true, minWidth: '190px' },
  { id: 'dateOfSubmission', label: 'Date of Submission', visible: true, minWidth: '150px' },
  { id: 'referenceNumber', label: 'Reference Number', visible: true, minWidth: '150px' },
  { id: 'followUpDate', label: 'Follow Up Date', visible: true, minWidth: '130px' },
  { id: 'responsibleUser', label: 'Responsible User', visible: true, minWidth: '170px' },
  { id: 'effectiveDate', label: 'Effective Date', visible: true, minWidth: '130px' },
  { id: 'recredentialingDate', label: 'Recredentialing Date', visible: true, minWidth: '150px' },
  { id: 'providerInsuranceId', label: 'Provider Insurance ID', visible: true, minWidth: '170px' },
  { id: 'notes', label: 'Notes', visible: true, minWidth: '320px' }
];

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

  // Column Settings State (Image 4 - Reorder & Toggle columns)
  const [columns, setColumns] = useState<ColumnDef[]>(() => {
    try {
      const saved = localStorage.getItem('mantra_enrollment_columns');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_COLUMNS;
  });
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  const [draggedColumnIdx, setDraggedColumnIdx] = useState<number | null>(null);

  const visibleColumns = useMemo(() => columns.filter(c => c.visible), [columns]);

  const toggleColumnVisibility = (id: string) => {
    setColumns(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c);
      try { localStorage.setItem('mantra_enrollment_columns', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const moveColumn = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= columns.length) return;
    setColumns(prev => {
      const list = [...prev];
      const [moved] = list.splice(fromIdx, 1);
      list.splice(toIdx, 0, moved);
      try { localStorage.setItem('mantra_enrollment_columns', JSON.stringify(list)); } catch {}
      return list;
    });
  };

  const resetColumns = () => {
    setColumns(DEFAULT_COLUMNS);
    try { localStorage.removeItem('mantra_enrollment_columns'); } catch {}
  };

  // Client Detail Side Drawer State
  const [selectedClientRecord, setSelectedClientRecord] = useState<EnrollmentRecord | null>(null);

  useEffect(() => {
    if (selectedClientRecord) {
      const live = enrollments.find(e => e.id === selectedClientRecord.id);
      if (live) {
        setSelectedClientRecord(live);
      }
    }
  }, [enrollments]);

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
  const priority: 'High' | 'Medium' | 'Low' = 'Medium';
  const modalStatus = 'Pending';
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

      {/* Scrollable Rows Table with all Configurable Columns */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0 min-w-[2100px]">
            <colgroup>
              <col style={{ width: '44px', minWidth: '44px', maxWidth: '44px' }} />
              <col style={{ width: '40px', minWidth: '40px', maxWidth: '40px' }} />
              {visibleColumns.map((col, idx) => (
                <col key={col.id} style={{ minWidth: col.minWidth, width: idx === 0 ? '220px' : undefined }} />
              ))}
            </colgroup>
            <thead>
              <tr className="bg-[#002B49] text-white text-[11px] font-bold uppercase tracking-wider">
                {/* Checkbox Column */}
                <th className="py-3.5 px-0 w-[44px] min-w-[44px] max-w-[44px] text-center sticky left-0 bg-[#002B49] z-30 border-r border-b border-[#1a4a6e] box-border">
                  <div className="w-[44px] flex items-center justify-center">
                    <input type="checkbox" className="rounded cursor-pointer" />
                  </div>
                </th>
                {/* Column Settings Gear Icon */}
                <th className="py-3.5 px-0 w-[40px] min-w-[40px] max-w-[40px] text-center sticky left-[44px] bg-[#002B49] z-30 border-r border-b border-[#1a4a6e] box-border">
                  <div className="w-[40px] flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setIsColumnSettingsOpen(true)}
                      className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer mx-auto text-slate-200 hover:text-white"
                      title="Column Settings (Reorder & Toggle Columns)"
                    >
                      <Settings size={15} />
                    </button>
                  </div>
                </th>
                {/* Dynamically Ordered Visible Columns */}
                {visibleColumns.map((col, idx) => (
                  <th
                    key={col.id}
                    className={`py-3.5 px-4 whitespace-nowrap border-r border-b border-[#1a4a6e] box-border ${
                      idx === 0 ? 'sticky left-[84px] bg-[#002B49] z-30 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.25)]' : ''
                    }`}
                    style={{ minWidth: col.minWidth }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-xs">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="text-center py-16 text-slate-400 text-sm border-b border-slate-100">
                    {isSpecialist 
                      ? `No enrollment requests currently assigned to ${currentPersona.name}.`
                      : `No enrollment requests found matching your filters.`}
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Row Checkbox & Drag / Menu Icon */}
                    <td className="py-3 px-0 w-[44px] min-w-[44px] max-w-[44px] text-center sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-20 border-r border-b border-slate-100 box-border">
                      <div className="w-[44px] flex items-center justify-center">
                        <input type="checkbox" className="rounded text-blue-600 cursor-pointer" />
                      </div>
                    </td>
                    <td className="py-3 px-0 w-[40px] min-w-[40px] max-w-[40px] text-center text-slate-400 sticky left-[44px] bg-white group-hover:bg-slate-50 transition-colors z-20 border-r border-b border-slate-100 box-border select-none">
                      <div className="w-[40px] flex items-center justify-center">
                        <span>≡</span>
                      </div>
                    </td>

                    {/* Dynamically Render Visible Columns in Customized Order */}
                    {visibleColumns.map((col, idx) => {
                      const isFirst = idx === 0;
                      const stickyClass = isFirst 
                        ? 'sticky left-[84px] bg-white group-hover:bg-slate-50 transition-colors z-20 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.06)] border-r border-b border-slate-100 box-border'
                        : 'border-r border-b border-slate-100 box-border';

                      switch (col.id) {
                        case 'providerName':
                          return (
                            <td key={col.id} className={`py-3 px-4 ${stickyClass}`}>
                              <button
                                type="button"
                                onClick={() => setSelectedClientRecord(item)}
                                className="text-left group/btn cursor-pointer focus:outline-none"
                                title="Click to view client details, processes & documents"
                              >
                                <div className="font-semibold text-blue-600 group-hover/btn:text-blue-800 group-hover/btn:underline whitespace-nowrap">
                                  {item.providerName}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5 font-normal">
                                  ID: #{item.id}
                                </div>
                              </button>
                            </td>
                          );
                        case 'organization':
                          return (
                            <td key={col.id} className={`py-3 px-4 text-slate-700 font-medium whitespace-nowrap ${stickyClass}`}>
                              {item.organization}
                            </td>
                          );
                        case 'service':
                          return (
                            <td key={col.id} className={`py-3 px-4 text-blue-700 font-semibold uppercase whitespace-nowrap ${stickyClass}`}>
                              {item.service}
                            </td>
                          );
                        case 'state':
                          return (
                            <td key={col.id} className={`py-3 px-4 text-slate-700 font-medium whitespace-nowrap ${stickyClass}`}>
                              {item.state || '—'}
                            </td>
                          );
                        case 'type':
                          return (
                            <td key={col.id} className={`py-3 px-4 text-slate-700 whitespace-nowrap ${stickyClass}`}>
                              {item.type || 'Commercial'}
                            </td>
                          );
                        case 'payer':
                          return (
                            <td key={col.id} className={`py-3 px-4 font-bold text-slate-900 whitespace-nowrap ${stickyClass}`}>
                              {item.payer || item.insurance}
                            </td>
                          );
                        case 'priority':
                          return (
                            <td key={col.id} className={`py-3 px-4 text-center whitespace-nowrap ${stickyClass}`}>
                              <PriorityBadge 
                                priority={item.priority || 'Low'} 
                                onChange={(newPriority) => {
                                  updateEnrollmentDetails(item.id, { priority: newPriority });
                                }}
                              />
                            </td>
                          );
                        case 'stage':
                          return (
                            <td key={col.id} className={`py-3 px-4 whitespace-nowrap ${stickyClass}`}>
                              <PipelineStageBar
                                status={item.status}
                                onChange={(newStatus) => {
                                  updateEnrollmentStatus(item.id, newStatus);
                                }}
                              />
                            </td>
                          );
                        case 'dateOfSubmission':
                          return (
                            <td key={col.id} className={`py-3 px-4 text-slate-600 whitespace-nowrap font-medium ${stickyClass}`}>
                              {item.dateOfSubmission || item.date || '—'}
                            </td>
                          );
                        case 'referenceNumber':
                          return (
                            <td key={col.id} className={`py-3 px-4 text-slate-800 font-mono text-[11px] whitespace-nowrap ${stickyClass}`}>
                              {item.referenceNumber ? (
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                                  {item.referenceNumber}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                          );
                        case 'followUpDate':
                          return (
                            <td key={col.id} className={`py-3 px-4 text-slate-600 whitespace-nowrap font-medium ${stickyClass}`}>
                              {item.followUpDate || '—'}
                            </td>
                          );
                        case 'responsibleUser':
                          return (
                            <td key={col.id} className={`py-3 px-4 whitespace-nowrap ${stickyClass}`}>
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
                          );
                        case 'effectiveDate':
                          return (
                            <td key={col.id} className={`py-3 px-4 whitespace-nowrap ${stickyClass}`}>
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
                          );
                        case 'recredentialingDate':
                          return (
                            <td key={col.id} className={`py-3 px-4 text-slate-600 whitespace-nowrap font-medium ${stickyClass}`}>
                              {item.recredentialingDate || '—'}
                            </td>
                          );
                        case 'providerInsuranceId':
                          return (
                            <td key={col.id} className={`py-3 px-4 whitespace-nowrap font-mono text-[11px] ${stickyClass}`}>
                              {item.providerInsuranceId ? (
                                <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200">
                                  {item.providerInsuranceId}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                          );
                        case 'notes':
                          return (
                            <td 
                              key={col.id}
                              className={`py-3 px-4 text-slate-600 min-w-[320px] max-w-[420px] truncate ${stickyClass}`}
                              title={item.notes}
                            >
                              {item.notes || '—'}
                            </td>
                          );
                        default:
                          return null;
                      }
                    })}
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

      {/* Column Settings Modal Dialog (Matching Image 4) */}
      {isColumnSettingsOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsColumnSettingsOpen(false)}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all z-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900">Column Settings</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Drag to reorder columns or toggle their visibility.
                </p>
              </div>

              {/* Scrollable list of columns */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {columns.map((col, idx) => (
                  <div
                    key={col.id}
                    draggable
                    onDragStart={() => setDraggedColumnIdx(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedColumnIdx !== null && draggedColumnIdx !== idx) {
                        moveColumn(draggedColumnIdx, idx);
                      }
                      setDraggedColumnIdx(null);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      draggedColumnIdx === idx 
                        ? 'border-blue-400 bg-blue-50/50 shadow-md scale-[1.01]' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* 6-dot drag handle */}
                      <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
                        <GripVertical size={16} />
                      </div>

                      {/* Checkbox matching Image 4 */}
                      <button
                        type="button"
                        onClick={() => toggleColumnVisibility(col.id)}
                        className={`w-4 h-4 rounded flex items-center justify-center transition-colors cursor-pointer ${
                          col.visible 
                            ? 'bg-blue-600 text-white' 
                            : 'border border-slate-300 bg-white'
                        }`}
                      >
                        {col.visible && <Check size={12} strokeWidth={3} />}
                      </button>

                      {/* Column Title */}
                      <span className={`text-xs font-bold uppercase tracking-wider ${col.visible ? 'text-slate-800' : 'text-slate-400'}`}>
                        {col.label}
                      </span>
                    </div>

                    {/* Move Up & Down Arrow Buttons */}
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveColumn(idx, idx - 1)}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={idx === columns.length - 1}
                        onClick={() => moveColumn(idx, idx + 1)}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetColumns}
                  className="text-xs text-slate-500 hover:text-blue-600 font-semibold cursor-pointer"
                >
                  Reset Default
                </button>

                <button
                  type="button"
                  onClick={() => setIsColumnSettingsOpen(false)}
                  className="px-5 py-2 rounded-xl bg-[#1c2d42] hover:bg-[#002B49] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Detail Side Drawer (70% screen width) */}
      {selectedClientRecord && (
        <ClientDetailDrawer
          client={selectedClientRecord}
          onClose={() => setSelectedClientRecord(null)}
          onUpdate={(updated) => {
            updateEnrollmentDetails(updated.id, updated);
            setSelectedClientRecord(updated);
          }}
          onOpenNewEnrollment={() => {
            openAddModal();
          }}
        />
      )}
    </div>
  );
};
