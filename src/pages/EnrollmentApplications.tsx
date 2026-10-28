import React, { useState, useMemo } from 'react';
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
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';

export const EnrollmentApplications: React.FC = () => {
  const {
    enrollments,
    updateEnrollmentStatus,
    assignEnrollmentSpecialist,
    availableSpecialists,
    currentPersona,
    isAdmin,
    isSpecialist,
    isAssignedOnly
  } = useApp();

  const [activeToggle, setActiveToggle] = useState<'providers' | 'facilities'>('providers');
  const [searchTerm, setSearchTerm] = useState('');
  const [specialistFilter, setSpecialistFilter] = useState<string>('ALL');

  // Filtered Enrollments with Data Isolation logic
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(item => {
      // Specialist Data Isolation Rule:
      // If logged in as an assigned-only specialist, they ONLY see requests assigned to them!
      if (isAssignedOnly && item.assignedSpecialist !== currentPersona.name) {
        return false;
      }

      // Admin specialist filter
      if (isAdmin && specialistFilter !== 'ALL' && item.assignedSpecialist !== specialistFilter) {
        return false;
      }

      const matchSearch = searchTerm === '' ||
        item.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.insurance.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assignedSpecialist.toLowerCase().includes(searchTerm.toLowerCase());
      
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
            Manage and track insurance enrollment requests for providers and facilities.
          </p>
        </div>

        {/* Toggle Buttons: Providers / Facilities */}
        <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-xs self-start md:self-auto">
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
            placeholder="Search provider, insurance or org..."
            className="w-full text-sm text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500 whitespace-nowrap pl-4 border-l border-slate-100 hidden md:block">
          {filteredEnrollments.length} requests {isSpecialist ? `assigned to you` : `total`}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#002B49] text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Provider Name</th>
                <th className="py-4 px-6">Organization</th>
                <th className="py-4 px-6">Service</th>
                <th className="py-4 px-6">Insurance</th>
                <th className="py-4 px-6 text-center">Assigned Specialist</th>
                <th className="py-4 px-6 text-center">Order Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400 text-sm">
                    {isSpecialist 
                      ? `No enrollment requests currently assigned to ${currentPersona.name}.`
                      : `No enrollment requests found matching your filters.`}
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900 leading-tight">
                        {item.providerName}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        ID: {item.id} • {item.date}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium text-xs">
                      {item.organization}
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold text-slate-800 uppercase">
                      {item.service}
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold text-slate-900">
                      {item.insurance}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {isAdmin ? (
                        <select
                          value={item.assignedSpecialist}
                          onChange={(e) => assignEnrollmentSpecialist(item.id, e.target.value)}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 cursor-pointer focus:outline-none"
                        >
                          {availableSpecialists.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <UserCheck size={12} />
                          {item.assignedSpecialist}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <StatusBadge
                        status={item.status}
                        interactive={true}
                        options={['PENDING', 'ACTIVE', 'SUBMITTED']}
                        onChange={(s) => updateEnrollmentStatus(item.id, s)}
                      />
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
    </div>
  );
};
