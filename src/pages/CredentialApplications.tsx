import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Search, 
  Clock, 
  Eye, 
  EyeOff,
  GripVertical,
  RotateCcw,
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { ApplicationDetailModal } from '../components/ApplicationDetailModal';
import { StatusHistoryModal } from '../components/StatusHistoryModal';

export interface ColumnDef {
  id: string;
  label: string;
  visible: boolean;
  minWidth?: string;
}

const DEFAULT_CREDENTIAL_COLUMNS: ColumnDef[] = [
  { id: 'email', label: 'Email', visible: true, minWidth: '180px' },
  { id: 'organization', label: 'Organization', visible: true, minWidth: '160px' },
  { id: 'service', label: 'Service', visible: true, minWidth: '130px' },
  { id: 'country', label: 'Country', visible: true, minWidth: '140px' },
  { id: 'referredBy', label: 'Referred by', visible: true, minWidth: '150px' },
  { id: 'onboardedBy', label: 'Onboarded by', visible: true, minWidth: '160px' },
  { id: 'opsResponsible', label: 'Ops Responsible', visible: true, minWidth: '180px' },
  { id: 'credentialingStartDate', label: 'Credentialing start date', visible: true, minWidth: '160px' },
  { id: 'enrollmentStartDate', label: 'Enrollment start date', visible: true, minWidth: '160px' },
  { id: 'status', label: 'Status', visible: true, minWidth: '140px' }
];

export const CredentialApplications: React.FC = () => {
  const {
    providers,
    updateProviderStatus,
    assignProviderSpecialist,
    facilities,
    updateFacilityStatus,
    assignFacilitySpecialist,
    availableSpecialists,
    currentPersona,
    isAdmin,
    isSuperAdmin,
    isAssignedOnly
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'providers' | 'facilities'>('providers');
  const [searchTerm, setSearchTerm] = useState('');
  const [specialistFilter, setSpecialistFilter] = useState('ALL');
  
  // Modals state
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [historyTitle, setHistoryTitle] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Column Settings Dialog State (Triggered by ⚙ in table header)
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  const [draggedColumnIdx, setDraggedColumnIdx] = useState<number | null>(null);
  const [columns, setColumns] = useState<ColumnDef[]>(() => {
    try {
      const saved = localStorage.getItem('mantra_credential_columns');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_CREDENTIAL_COLUMNS;
  });

  const visibleColumns = useMemo(() => columns.filter(c => c.visible), [columns]);

  const toggleColumnVisibility = (id: string) => {
    setColumns(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c);
      try { localStorage.setItem('mantra_credential_columns', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const reorderColumns = (fromIdx: number, toIdx: number) => {
    setColumns(prev => {
      const list = [...prev];
      const [moved] = list.splice(fromIdx, 1);
      list.splice(toIdx, 0, moved);
      try { localStorage.setItem('mantra_credential_columns', JSON.stringify(list)); } catch {}
      return list;
    });
  };

  const resetColumns = () => {
    setColumns(DEFAULT_CREDENTIAL_COLUMNS);
    try { localStorage.removeItem('mantra_credential_columns'); } catch {}
  };

  // Floating hamburger action menu open state (≡ icon in Col 1)
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);

  // Close hamburger menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Filtered providers with Data Isolation & Ops Specialist filter
  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      // Data isolation for specialist persona: only see records assigned to them
      if (isAssignedOnly && (p.opsResponsible || p.assignedSpecialist) !== currentPersona.name) {
        return false;
      }
      if (specialistFilter !== 'ALL' && (p.opsResponsible || p.assignedSpecialist) !== specialistFilter) {
        return false;
      }
      const matchSearch = searchTerm === '' || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.onboardedBy && p.onboardedBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ((p.opsResponsible || p.assignedSpecialist) && (p.opsResponsible || p.assignedSpecialist)!.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSearch;
    });
  }, [providers, searchTerm, isAssignedOnly, currentPersona.name, specialistFilter]);

  // Filtered facilities with Data Isolation & Ops Specialist filter
  const filteredFacilities = useMemo(() => {
    return facilities.filter(f => {
      // Data isolation for specialist persona: only see facilities assigned to them
      if (isAssignedOnly && (f.opsResponsible || f.assignedSpecialist) !== currentPersona.name) {
        return false;
      }
      if (specialistFilter !== 'ALL' && (f.opsResponsible || f.assignedSpecialist) !== specialistFilter) {
        return false;
      }
      const matchSearch = searchTerm === '' || 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.onboardedBy && f.onboardedBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ((f.opsResponsible || f.assignedSpecialist) && (f.opsResponsible || f.assignedSpecialist)!.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSearch;
    });
  }, [facilities, searchTerm, isAssignedOnly, currentPersona.name, specialistFilter]);

  // Summary counts for facilities
  const facilityStats = useMemo(() => {
    const list = isAssignedOnly 
      ? facilities.filter(f => (f.opsResponsible || f.assignedSpecialist) === currentPersona.name)
      : facilities;
    const total = list.length;
    const drafts = list.filter(f => f.status === 'DRAFT').length;
    const submitted = list.filter(f => f.status === 'SUBMITTED').length;
    const underReview = list.filter(f => f.status === 'UNDER REVIEW').length;
    const needsInfo = list.filter(f => f.status === 'NEEDS INFO').length;
    const approved = list.filter(f => f.status === 'APPROVED').length;
    const rejected = list.filter(f => f.status === 'REJECTED').length;
    return { total, drafts, submitted, underReview, needsInfo, approved, rejected };
  }, [facilities, isAssignedOnly, currentPersona.name]);

  const canManageAssignments = isAdmin || isSuperAdmin;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Credential Applications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review healthcare provider credentialing applications, verify credentials, and manage ops assignments.
          </p>
        </div>

        {/* Toggle Pills: Providers / Groups & Facilities */}
        <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-xs self-start md:self-auto">
          <button
            onClick={() => {
              setActiveSubTab('providers');
              setSearchTerm('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeSubTab === 'providers'
                ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={16} />
            Providers
          </button>
          <button
            onClick={() => {
              setActiveSubTab('facilities');
              setSearchTerm('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeSubTab === 'facilities'
                ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 size={16} />
            Groups / Facilities
          </button>
        </div>
      </div>

      {/* Scope Alert Banner matching Enrollment Applications */}
      {isAssignedOnly ? (
        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950 shadow-2xs">
          <div className="flex items-center gap-2 font-medium">
            <UserCheck size={16} className="text-emerald-600 shrink-0" />
            <span>
              <strong>Specialist Workload Mode:</strong> You are viewing as <strong>{currentPersona.name}</strong> ({currentPersona.role}). Showing strictly only applications assigned to you.
            </span>
          </div>
          <span className="font-bold text-[10px] tracking-wide uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded border border-emerald-300">
            Assigned Only Scope
          </span>
        </div>
      ) : (
        <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900 shadow-2xs">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck size={16} className="text-blue-600 shrink-0" />
            <span>
              <strong>Admin Access Active:</strong> Reviewing all credentialing applications across the entire organization. Ops team can reassign responsible specialists at any stage.
            </span>
          </div>
          <span className="font-bold text-[10px] tracking-wide uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
            Global View Scope
          </span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Search size={18} className="text-slate-400 shrink-0" />
          
          <button className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 text-xs font-semibold text-blue-600 shrink-0 cursor-pointer flex items-center gap-1.5">
            {activeSubTab === 'providers' ? 'All providers' : 'All facilities'}
            <ChevronDown size={13} />
          </button>

          {/* Admin Ops Responsible Filter Dropdown */}
          {isAdmin && (
            <div className="relative">
              <select
                value={specialistFilter}
                onChange={(e) => setSpecialistFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none appearance-none pr-7"
              >
                <option value="ALL">All Ops Specialists</option>
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
            placeholder={
              activeSubTab === 'providers'
                ? 'Search provider, email, organization, onboarded by, ops responsible...'
                : 'Search facility, email, organization, onboarded by, ops responsible...'
            }
            className="w-full text-sm text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500 whitespace-nowrap pl-4 border-l border-slate-100 hidden md:flex items-center gap-2">
          <span>
            {activeSubTab === 'providers' ? filteredProviders.length : filteredFacilities.length} records
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400 font-normal">
            {activeSubTab === 'providers' ? 'Credential Applications' : 'Facility Submissions'}
          </span>
        </div>
      </div>

      {/* Main Content Table Container matching User's Exact Layout:
          Col 1: ⚙ in Header, ≡ in Rows (Hamburger Menu Action with View Details & Status History)
          Col 2: PROVIDER NAME
          Col 3..N: Dynamic Columns (Email, Org, Service, Country, Onboarded by, Ops Responsible, Status)
          NO SELECT BOXES
      */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {activeSubTab === 'providers' ? (
            /* Providers Table */
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-[#002B49] text-white text-[11px] font-bold uppercase tracking-wider">
                  {/* Col 1: Settings Gear Icon */}
                  <th className="py-3.5 px-0 w-[44px] min-w-[44px] max-w-[44px] text-center border-r border-b border-[#1a4a6e] box-border">
                    <button
                      type="button"
                      onClick={() => setIsColumnSettingsOpen(true)}
                      className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer mx-auto text-slate-200 hover:text-white"
                      title="Column Settings (Reorder & Toggle Columns)"
                    >
                      <Settings size={15} />
                    </button>
                  </th>

                  {/* Col 2: Provider Name */}
                  <th className="py-3.5 px-5 border-r border-b border-[#1a4a6e] whitespace-nowrap min-w-[220px]">
                    PROVIDER NAME
                  </th>

                  {/* Dynamic Columns */}
                  {visibleColumns.map((col, idx) => {
                    const isLast = idx === visibleColumns.length - 1;
                    return (
                      <th
                        key={col.id}
                        className={`py-3.5 px-4 border-b border-[#1a4a6e] whitespace-nowrap ${
                          !isLast ? 'border-r border-[#1a4a6e]' : ''
                        } ${col.id === 'status' ? 'text-center' : ''}`}
                        style={{ minWidth: col.minWidth }}
                      >
                        {col.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="text-xs">
                {filteredProviders.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumns.length + 2} className="text-center py-16 text-slate-400 text-sm border-b border-slate-100">
                      No applications found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProviders.map((item, idx) => {
                    const isNearBottom = idx >= filteredProviders.length - 2 && filteredProviders.length > 2;
                    return (
                      <tr key={item.id} className={`hover:bg-slate-50/80 transition-colors group ${openMenuId === item.id ? 'relative z-50' : ''}`}>
                        {/* Col 1: Hamburger Menu Action (≡) */}
                        <td className={`py-3 px-0 w-[44px] min-w-[44px] max-w-[44px] text-center border-r border-b border-slate-100 box-border relative ${
                          openMenuId === item.id ? 'z-50' : ''
                        }`}>
                          <div className={`relative inline-block text-center ${openMenuId === item.id ? 'z-50' : ''}`}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === item.id ? null : item.id);
                              }}
                              className={`w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer mx-auto ${
                                openMenuId === item.id
                                  ? 'bg-blue-100 text-blue-700 font-bold'
                                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                              }`}
                              title="Actions (View Details, Status History)"
                              aria-label="Actions"
                            >
                              <span className="text-base select-none font-bold leading-none">≡</span>
                            </button>

                            {openMenuId === item.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className={`absolute left-full ml-1 w-44 rounded-xl bg-white border border-slate-200 shadow-2xl py-1.5 z-[100] text-left font-medium text-xs tracking-wide animate-in fade-in zoom-in-95 duration-100 ${
                                  isNearBottom ? 'bottom-0' : 'top-0'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    setSelectedRecord(item);
                                    setIsDetailOpen(true);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left cursor-pointer font-semibold"
                                >
                                  <Eye size={14} className="text-blue-600" />
                                  <span>View Details</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    setHistoryTitle(`${item.name} (ID: #${item.id})`);
                                    setIsHistoryOpen(true);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left border-t border-slate-100 cursor-pointer font-semibold"
                                >
                                  <Clock size={14} className="text-amber-600" />
                                  <span>Status History</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Col 2: Provider Name with ID underneath (Matching Screenshot) */}
                        <td className="py-3 px-5 border-r border-b border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRecord(item);
                              setIsDetailOpen(true);
                            }}
                            className="text-left group/btn cursor-pointer focus:outline-none"
                            title="Click to view application details"
                          >
                            <div className="font-semibold text-blue-600 group-hover/btn:text-blue-800 group-hover/btn:underline whitespace-nowrap">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-normal">
                              ID: #{item.id}
                            </div>
                          </button>
                        </td>

                        {/* Dynamic Visible Columns */}
                        {visibleColumns.map((col, cIdx) => {
                          const isLast = cIdx === visibleColumns.length - 1;
                          const borderClass = isLast ? 'border-b border-slate-100' : 'border-r border-b border-slate-100';

                          switch (col.id) {
                            case 'email':
                              return (
                                <td key={col.id} className={`py-3 px-4 text-slate-600 font-medium whitespace-nowrap ${borderClass}`}>
                                  {item.email}
                                </td>
                              );
                            case 'organization': {
                              const orgList = item.organizations && item.organizations.length > 0 ? item.organizations : [item.organization];
                              return (
                                <td key={col.id} className={`py-3 px-4 whitespace-nowrap ${borderClass}`}>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {orgList.map((org, oIdx) => (
                                      <span key={oIdx} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                        {org}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              );
                            }
                            case 'service':
                              return (
                                <td key={col.id} className={`py-3 px-4 text-blue-700 font-semibold uppercase tracking-tight whitespace-nowrap ${borderClass}`}>
                                  {item.service}
                                </td>
                              );
                            case 'country':
                              return (
                                <td key={col.id} className={`py-3 px-4 text-slate-700 whitespace-nowrap ${borderClass}`}>
                                  <span className="mr-1.5">{item.countryFlag}</span>
                                  {item.country}
                                </td>
                              );
                            case 'referredBy':
                              return (
                                <td key={col.id} className={`py-3 px-4 whitespace-nowrap ${borderClass}`}>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200">
                                    {item.referredBy || 'Portal (Direct)'}
                                  </span>
                                </td>
                              );
                            case 'onboardedBy':
                              return (
                                <td key={col.id} className={`py-3 px-4 whitespace-nowrap ${borderClass}`}>
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200">
                                    <UserCheck size={12} className="text-slate-400 shrink-0" />
                                    <span>{item.onboardedBy || 'Self (Portal)'}</span>
                                  </span>
                                </td>
                              );
                            case 'opsResponsible':
                              return (
                                <td key={col.id} className={`py-3 px-4 whitespace-nowrap ${borderClass}`}>
                                  {canManageAssignments ? (
                                    <div className="relative inline-block text-left">
                                      <select
                                        value={item.opsResponsible || item.assignedSpecialist || availableSpecialists[0]}
                                        onChange={(e) => assignProviderSpecialist(item.id, e.target.value)}
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
                                    <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                                      {item.opsResponsible || item.assignedSpecialist || 'Unassigned'}
                                    </span>
                                  )}
                                </td>
                              );
                            case 'credentialingStartDate':
                              return (
                                <td key={col.id} className={`py-3 px-4 text-slate-600 font-medium whitespace-nowrap ${borderClass}`}>
                                  {item.credentialingStartDate || item.date || '—'}
                                </td>
                              );
                            case 'enrollmentStartDate':
                              return (
                                <td key={col.id} className={`py-3 px-4 whitespace-nowrap ${borderClass}`}>
                                  {item.enrollmentStartDate && item.enrollmentStartDate !== 'Pending' && item.enrollmentStartDate !== '—' ? (
                                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                                      {item.enrollmentStartDate}
                                    </span>
                                  ) : (
                                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] font-semibold">
                                      {item.enrollmentStartDate || 'Pending'}
                                    </span>
                                  )}
                                </td>
                              );
                            case 'status':
                              return (
                                <td key={col.id} className={`py-3 px-4 text-center whitespace-nowrap ${borderClass}`}>
                                  <StatusBadge
                                    status={item.status}
                                    interactive={true}
                                    options={['DRAFT', 'NEEDS INFO', 'APPROVED', 'SUBMITTED', 'UNDER REVIEW', 'REJECTED']}
                                    onChange={(s) => updateProviderStatus(item.id, s)}
                                  />
                                </td>
                              );
                            default:
                              return null;
                          }
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            /* Groups / Facilities Table */
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-[#002B49] text-white text-[11px] font-bold uppercase tracking-wider">
                  {/* Col 1: Settings Gear Icon */}
                  <th className="py-3.5 px-0 w-[44px] min-w-[44px] max-w-[44px] text-center border-r border-b border-[#1a4a6e] box-border">
                    <button
                      type="button"
                      onClick={() => setIsColumnSettingsOpen(true)}
                      className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer mx-auto text-slate-200 hover:text-white"
                      title="Column Settings (Reorder & Toggle Columns)"
                    >
                      <Settings size={15} />
                    </button>
                  </th>

                  {/* Col 2: Facility / Group Name */}
                  <th className="py-3.5 px-5 border-r border-b border-[#1a4a6e] whitespace-nowrap min-w-[220px]">
                    FACILITY / GROUP
                  </th>

                  {/* Dynamic Columns */}
                  {visibleColumns.map((col, idx) => {
                    const isLast = idx === visibleColumns.length - 1;
                    return (
                      <th
                        key={col.id}
                        className={`py-3.5 px-4 border-b border-[#1a4a6e] whitespace-nowrap ${
                          !isLast ? 'border-r border-[#1a4a6e]' : ''
                        } ${col.id === 'status' ? 'text-center' : ''}`}
                        style={{ minWidth: col.minWidth }}
                      >
                        {col.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="text-xs">
                {filteredFacilities.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumns.length + 2} className="text-center py-16 text-slate-400 text-sm border-b border-slate-100">
                      No facilities found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredFacilities.map((item, idx) => {
                    const isNearBottom = idx >= filteredFacilities.length - 2 && filteredFacilities.length > 2;
                    return (
                      <tr key={item.id} className={`hover:bg-slate-50/80 transition-colors group ${openMenuId === item.id ? 'relative z-50' : ''}`}>
                        {/* Col 1: Hamburger Menu Action (≡) */}
                        <td className={`py-3 px-0 w-[44px] min-w-[44px] max-w-[44px] text-center border-r border-b border-slate-100 box-border relative ${
                          openMenuId === item.id ? 'z-50' : ''
                        }`}>
                          <div className={`relative inline-block text-center ${openMenuId === item.id ? 'z-50' : ''}`}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === item.id ? null : item.id);
                              }}
                              className={`w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer mx-auto ${
                                openMenuId === item.id
                                  ? 'bg-blue-100 text-blue-700 font-bold'
                                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                              }`}
                              title="Actions (View Details, Status History)"
                              aria-label="Actions"
                            >
                              <span className="text-base select-none font-bold leading-none">≡</span>
                            </button>

                            {openMenuId === item.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className={`absolute left-full ml-1 w-44 rounded-xl bg-white border border-slate-200 shadow-2xl py-1.5 z-[100] text-left font-medium text-xs tracking-wide animate-in fade-in zoom-in-95 duration-100 ${
                                  isNearBottom ? 'bottom-0' : 'top-0'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    setSelectedRecord(item);
                                    setIsDetailOpen(true);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left cursor-pointer font-semibold"
                                >
                                  <Eye size={14} className="text-blue-600" />
                                  <span>View Details</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    setHistoryTitle(`${item.name} (${item.type})`);
                                    setIsHistoryOpen(true);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left border-t border-slate-100 cursor-pointer font-semibold"
                                >
                                  <Clock size={14} className="text-amber-600" />
                                  <span>Status History</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Col 2: Facility Name */}
                        <td className="py-3 px-5 border-r border-b border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRecord(item);
                              setIsDetailOpen(true);
                            }}
                            className="text-left group/btn cursor-pointer focus:outline-none"
                            title="Click to view facility details"
                          >
                            <div className="font-semibold text-blue-600 group-hover/btn:text-blue-800 group-hover/btn:underline whitespace-nowrap">
                              {item.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded tracking-wider">
                                {item.type}
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal">ID: #{item.id}</span>
                            </div>
                          </button>
                        </td>

                        {/* Dynamic Visible Columns */}
                        {visibleColumns.map((col, cIdx) => {
                          const isLast = cIdx === visibleColumns.length - 1;
                          const borderClass = isLast ? 'border-b border-slate-100' : 'border-r border-b border-slate-100';

                          switch (col.id) {
                            case 'email':
                              return (
                                <td key={col.id} className={`py-3 px-4 text-slate-600 font-medium whitespace-nowrap ${borderClass}`}>
                                  {item.email}
                                </td>
                              );
                            case 'organization': {
                              const orgList = item.organizations && item.organizations.length > 0 ? item.organizations : [item.organization];
                              return (
                                <td key={col.id} className={`py-3 px-4 whitespace-nowrap ${borderClass}`}>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {orgList.map((org, oIdx) => (
                                      <span key={oIdx} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                        {org}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              );
                            }
                            case 'service':
                              return (
                                <td key={col.id} className={`py-3 px-4 text-blue-700 font-semibold uppercase tracking-tight whitespace-nowrap ${borderClass}`}>
                                  {item.service}
                                </td>
                              );
                            case 'country':
                              return (
                                <td key={col.id} className={`py-3 px-4 text-slate-700 whitespace-nowrap ${borderClass}`}>
                                  <span className="mr-1.5">{item.countryFlag}</span>
                                  {item.country}
                                </td>
                              );
                            case 'referredBy':
                              return (
                                <td key={col.id} className={`py-3 px-4 whitespace-nowrap ${borderClass}`}>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200">
                                    {item.referredBy || 'Portal (Direct)'}
                                  </span>
                                </td>
                              );
                            case 'onboardedBy':
                              return (
                                <td key={col.id} className={`py-3 px-4 whitespace-nowrap ${borderClass}`}>
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200">
                                    <UserCheck size={12} className="text-slate-400 shrink-0" />
                                    <span>{item.onboardedBy || 'Self (Portal)'}</span>
                                  </span>
                                </td>
                              );
                            case 'opsResponsible':
                              return (
                                <td key={col.id} className={`py-3 px-4 whitespace-nowrap ${borderClass}`}>
                                  {canManageAssignments ? (
                                    <div className="relative inline-block text-left">
                                      <select
                                        value={item.opsResponsible || item.assignedSpecialist || availableSpecialists[0]}
                                        onChange={(e) => assignFacilitySpecialist(item.id, e.target.value)}
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
                                    <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                                      {item.opsResponsible || item.assignedSpecialist || 'Unassigned'}
                                    </span>
                                  )}
                                </td>
                              );
                            case 'credentialingStartDate':
                              return (
                                <td key={col.id} className={`py-3 px-4 text-slate-600 font-medium whitespace-nowrap ${borderClass}`}>
                                  {item.credentialingStartDate || item.date || '—'}
                                </td>
                              );
                            case 'enrollmentStartDate':
                              return (
                                <td key={col.id} className={`py-3 px-4 whitespace-nowrap ${borderClass}`}>
                                  {item.enrollmentStartDate && item.enrollmentStartDate !== 'Pending' && item.enrollmentStartDate !== '—' ? (
                                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                                      {item.enrollmentStartDate}
                                    </span>
                                  ) : (
                                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] font-semibold">
                                      {item.enrollmentStartDate || 'Pending'}
                                    </span>
                                  )}
                                </td>
                              );
                            case 'status':
                              return (
                                <td key={col.id} className={`py-3 px-4 text-center whitespace-nowrap ${borderClass}`}>
                                  <StatusBadge
                                    status={item.status}
                                    interactive={true}
                                    options={['DRAFT', 'UNDER REVIEW', 'APPROVED', 'SUBMITTED', 'REJECTED', 'NEEDS INFO']}
                                    onChange={(s) => updateFacilityStatus(item.id, s)}
                                  />
                                </td>
                              );
                            default:
                              return null;
                          }
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Bottom Pagination & Metrics Bar matching Enrollment Applications */}
        <div className="p-4 border-t border-slate-100 flex flex-col xl:flex-row items-center justify-between gap-4 bg-white text-xs">
          <div className="flex items-center gap-6 text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <span className="uppercase text-[11px] font-semibold text-slate-400">Rows per page</span>
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-2 py-1 bg-white font-semibold text-slate-700">
                <span>20</span>
                <ChevronDown size={13} className="text-slate-400" />
              </div>
            </div>
            <div>
              Showing <span className="font-semibold text-slate-700">1-{activeSubTab === 'providers' ? filteredProviders.length : filteredFacilities.length}</span> of {activeSubTab === 'providers' ? (isAssignedOnly ? filteredProviders.length : providers.length) : (isAssignedOnly ? filteredFacilities.length : facilities.length)}
            </div>
          </div>

          {activeSubTab === 'facilities' && (
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                TOTAL : {facilityStats.total}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                DRAFTS : {facilityStats.drafts}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                SUBMITTED : {facilityStats.submitted}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                UNDER REVIEW : {facilityStats.underReview}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                NEEDS INFO : {facilityStats.needsInfo}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                APPROVED : {facilityStats.approved}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                REJECTED : {facilityStats.rejected}
              </span>
            </div>
          )}

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

      {/* Column Settings Modal (⚙ in header) */}
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

              <div className="space-y-1.5 max-h-[360px] overflow-y-auto py-1">
                {columns.map((col, idx) => (
                  <div
                    key={col.id}
                    draggable
                    onDragStart={() => setDraggedColumnIdx(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedColumnIdx !== null && draggedColumnIdx !== idx) {
                        reorderColumns(draggedColumnIdx, idx);
                      }
                      setDraggedColumnIdx(null);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs font-semibold transition-all ${
                      col.visible
                        ? 'bg-slate-50/80 border-slate-200 text-slate-800 hover:bg-slate-100/80'
                        : 'bg-white border-dashed border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <GripVertical size={14} className="text-slate-400 cursor-grab shrink-0" />
                      <span>{col.label}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleColumnVisibility(col.id)}
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        col.visible 
                          ? 'text-blue-600 hover:bg-blue-50' 
                          : 'text-slate-400 hover:bg-slate-100'
                      }`}
                      title={col.visible ? 'Hide column' : 'Show column'}
                    >
                      {col.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={resetColumns}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reset Default</span>
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

      {/* Detail Modal */}
      <ApplicationDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        data={selectedRecord}
        onAssignSpecialist={(id, spec) => {
          if (activeSubTab === 'providers') {
            assignProviderSpecialist(id, spec);
          } else {
            assignFacilitySpecialist(id, spec);
          }
        }}
        onApproveAndAssign={(id, spec) => {
          if (activeSubTab === 'providers') {
            updateProviderStatus(id, 'APPROVED');
            assignProviderSpecialist(id, spec);
          } else {
            updateFacilityStatus(id, 'APPROVED');
            assignFacilitySpecialist(id, spec);
          }
        }}
      />

      {/* Status History Modal */}
      <StatusHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title={historyTitle || ''}
      />
    </div>
  );
};
