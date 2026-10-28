import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Building2, 
  Search, 
  Clock, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { ApplicationDetailModal } from '../components/ApplicationDetailModal';
import { StatusHistoryModal } from '../components/StatusHistoryModal';

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
  
  // Modals state
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [historyTitle, setHistoryTitle] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Filtered providers with Data Isolation
  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      // Data isolation for specialist persona: only see records assigned to them
      if (isAssignedOnly && p.assignedSpecialist !== currentPersona.name) {
        return false;
      }
      const matchSearch = searchTerm === '' || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.assignedSpecialist && p.assignedSpecialist.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSearch;
    });
  }, [providers, searchTerm, isAssignedOnly, currentPersona.name]);

  // Filtered facilities with Data Isolation
  const filteredFacilities = useMemo(() => {
    return facilities.filter(f => {
      // Data isolation for specialist persona: only see facilities assigned to them
      if (isAssignedOnly && f.assignedSpecialist !== currentPersona.name) {
        return false;
      }
      const matchSearch = searchTerm === '' || 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.assignedSpecialist && f.assignedSpecialist.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSearch;
    });
  }, [facilities, searchTerm, isAssignedOnly, currentPersona.name]);

  // Summary counts for facilities
  const facilityStats = useMemo(() => {
    const list = isAssignedOnly 
      ? facilities.filter(f => f.assignedSpecialist === currentPersona.name)
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
            Applications Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review healthcare provider credentialing applications and assign representatives at any step.
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

      {/* Info notice about representative assignment */}
      {isAssignedOnly ? (
        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2 font-medium">
            <UserCheck size={16} className="text-emerald-600 shrink-0" />
            <span>
              <strong>Specialist Workload Mode:</strong> You are viewing as <strong>{currentPersona.name}</strong> ({currentPersona.role}). Showing strictly only applications assigned to you. Other representatives' files are restricted.
            </span>
          </div>
          <span className="font-bold text-[10px] tracking-wide uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded border border-emerald-300">
            Assigned Only Scope
          </span>
        </div>
      ) : (
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2 font-medium">
            <UserCheck size={16} className="text-blue-600 shrink-0" />
            <span>
              <strong>Representative Assignment:</strong> Managers and Admins can assign any team representative directly to an application at any stage (Draft, Review, or Approved).
            </span>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Search size={18} className="text-slate-400 shrink-0" />
          
          <button className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 text-xs font-semibold text-blue-600 shrink-0 cursor-pointer flex items-center gap-1.5">
            {activeSubTab === 'providers' ? 'All applications' : 'All facilities'}
            <ChevronDown size={13} />
          </button>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeSubTab === 'providers'
                ? 'Search provider, email, representative...'
                : 'Search facility, email, representative...'
            }
            className="w-full text-sm text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500 whitespace-nowrap pl-4 border-l border-slate-100 hidden md:block">
          {activeSubTab === 'providers' 
            ? `${filteredProviders.length} applications ${isAssignedOnly ? 'assigned to you' : ''}` 
            : `${filteredFacilities.length} submissions ${isAssignedOnly ? 'assigned to you' : ''}`}
        </div>
      </div>

      {/* Main Content Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {activeSubTab === 'providers' ? (
            /* Providers Table */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0b2545] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">Provider</th>
                  <th className="py-4 px-4">Email</th>
                  <th className="py-4 px-4">Organization</th>
                  <th className="py-4 px-4">Service</th>
                  <th className="py-4 px-4">Country</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 text-center">Assigned Representative</th>
                  <th className="py-4 px-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProviders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 text-sm">
                      No applications found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProviders.map((item) => {
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-semibold text-slate-900 leading-tight">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            ID: {item.id} • {item.date}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-600 font-medium text-xs max-w-[170px] truncate">
                          {item.email}
                        </td>
                        <td className="py-4 px-4 text-slate-700 font-medium text-xs">
                          {item.organization}
                        </td>
                        <td className="py-4 px-4 text-xs font-semibold text-slate-800 uppercase tracking-tight">
                          {item.service}
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-700 whitespace-nowrap">
                          <span className="mr-1.5">{item.countryFlag}</span>
                          {item.country}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <StatusBadge
                            status={item.status}
                            interactive={true}
                            options={['DRAFT', 'NEEDS INFO', 'APPROVED', 'SUBMITTED', 'UNDER REVIEW', 'REJECTED']}
                            onChange={(s) => updateProviderStatus(item.id, s)}
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          {canManageAssignments ? (
                            <div className="relative inline-block text-left">
                              <select
                                value={item.assignedSpecialist || ''}
                                onChange={(e) => assignProviderSpecialist(item.id, e.target.value)}
                                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  item.assignedSpecialist
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-slate-50 text-slate-500 border-slate-300'
                                }`}
                              >
                                <option value="">Assign Representative...</option>
                                {availableSpecialists.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-slate-700">
                              {item.assignedSpecialist || 'Unassigned'}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setHistoryTitle(`${item.name} (ID: ${item.id})`);
                                setIsHistoryOpen(true);
                              }}
                              className="w-7 h-7 rounded-full border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                              title="View Status History"
                            >
                              <Clock size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRecord(item);
                                setIsDetailOpen(true);
                              }}
                              className="w-7 h-7 rounded-full border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            /* Groups / Facilities Table */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0b2545] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">Facility / Group</th>
                  <th className="py-4 px-4">Email</th>
                  <th className="py-4 px-4">Organization</th>
                  <th className="py-4 px-4">Service</th>
                  <th className="py-4 px-4">Country</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 text-center">Assigned Representative</th>
                  <th className="py-4 px-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredFacilities.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-900 leading-tight">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded tracking-wider">
                            {item.type}
                          </span>
                          <span className="text-[11px] text-slate-400">{item.date}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 text-xs">
                        {item.email}
                      </td>
                      <td className="py-4 px-4 text-slate-700 font-medium text-xs">
                        {item.organization}
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold text-slate-800 uppercase">
                        {item.service}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-700 whitespace-nowrap">
                        <span className="mr-1.5">{item.countryFlag}</span>
                        {item.country}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <StatusBadge
                          status={item.status}
                          interactive={true}
                          options={['DRAFT', 'UNDER REVIEW', 'APPROVED', 'SUBMITTED', 'REJECTED', 'NEEDS INFO']}
                          onChange={(s) => updateFacilityStatus(item.id, s)}
                        />
                      </td>
                      <td className="py-4 px-4 text-center">
                        {canManageAssignments ? (
                          <select
                            value={item.assignedSpecialist || ''}
                            onChange={(e) => assignFacilitySpecialist(item.id, e.target.value)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              item.assignedSpecialist
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-slate-50 text-slate-500 border-slate-300'
                            }`}
                          >
                            <option value="">Assign Representative...</option>
                            {availableSpecialists.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs font-semibold text-slate-700">
                            {item.assignedSpecialist || 'Unassigned'}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setHistoryTitle(`${item.name} (${item.type})`);
                              setIsHistoryOpen(true);
                            }}
                            className="w-7 h-7 rounded-full border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                            title="View Status History"
                          >
                            <Clock size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRecord(item);
                              setIsDetailOpen(true);
                            }}
                            className="w-7 h-7 rounded-full border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Bottom Pagination & Metrics Bar */}
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
