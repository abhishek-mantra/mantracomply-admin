import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Eye, 
  FileText, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DocumentRecord } from '../data/mockData';
import { StatusBadge, StatusType } from '../components/StatusBadge';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';

export const DocumentVerification: React.FC = () => {
  const { 
    currentPersona, 
    isAssignedOnly, 
    isAdmin, 
    isSuperAdmin, 
    providers, 
    documents, 
    updateDocumentStatus, 
    assignDocumentSpecialist,
    availableSpecialists
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [specialistFilter, setSpecialistFilter] = useState('ALL');
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const canManageAssignments = isSuperAdmin || isAdmin;

  // Names of providers assigned to this specialist
  const assignedProviderNames = useMemo(() => {
    return providers
      .filter(p => p.assignedSpecialist === currentPersona.name)
      .map(p => p.name.toLowerCase());
  }, [providers, currentPersona.name]);

  const handleStatusChange = (id: string, newStatus: StatusType) => {
    updateDocumentStatus(id, newStatus);
    if (selectedDoc && selectedDoc.id === id) {
      setSelectedDoc(prev => prev ? { ...prev, status: newStatus as any } : null);
    }
  };

  const handleOpsResponsibleChange = (id: string, specialist: string) => {
    assignDocumentSpecialist(id, specialist);
    if (selectedDoc && selectedDoc.id === id) {
      setSelectedDoc(prev => prev ? { ...prev, opsResponsible: specialist } : null);
    }
  };

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const docSpecialist = doc.opsResponsible || 'Sarah Jenkins';

      // Data isolation for specialist
      if (isAssignedOnly && docSpecialist !== currentPersona.name && !assignedProviderNames.includes(doc.userName.toLowerCase())) {
        return false;
      }

      // Admin filter by specialist
      if ((isAdmin || isSuperAdmin) && specialistFilter !== 'ALL' && docSpecialist !== specialistFilter) {
        return false;
      }

      const matchSearch = searchTerm === '' ||
        doc.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        docSpecialist.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [documents, searchTerm, isAssignedOnly, assignedProviderNames, isAdmin, isSuperAdmin, specialistFilter, currentPersona.name]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Document Verification
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review and verify uploaded provider documents, licenses, and certificates.
        </p>
      </div>

      {/* Scope Banner */}
      {isAssignedOnly && (
        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2 font-medium">
            <span>
              <strong>Specialist Document Scope:</strong> Showing uploaded documents for healthcare providers assigned to you (<strong>{currentPersona.name}</strong>).
            </span>
          </div>
          <span className="font-bold text-[10px] tracking-wide uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded border border-emerald-300">
            Assigned Only Scope
          </span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Search size={18} className="text-slate-400 shrink-0" />
          
          <button className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 text-xs font-semibold text-blue-600 shrink-0 cursor-pointer flex items-center gap-1.5">
            All documents
            <ChevronDown size={13} />
          </button>

          {/* Admin Specialist Filter Dropdown */}
          {(isAdmin || isSuperAdmin) && (
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
              <ChevronDown size={12} className="text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          )}

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents, users or ops responsible..."
            className="w-full text-sm text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500 whitespace-nowrap pl-4 border-l border-slate-100 hidden md:block">
          {filteredDocs.length} documents {isAssignedOnly ? 'assigned to you' : ''}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#002B49] text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-5">User</th>
                <th className="py-4 px-4">Uploaded</th>
                <th className="py-4 px-5">Document</th>
                <th className="py-4 px-4">Expiry Date</th>
                <th className="py-4 px-4">Document Type</th>
                <th className="py-4 px-4">Ops Responsible</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredDocs.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5 font-semibold text-slate-900">
                    {item.userName}
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                    {item.uploadDate}
                  </td>
                  <td className="py-4 px-5">
                    <button
                      onClick={() => {
                        setSelectedDoc(item);
                        setIsPreviewOpen(true);
                      }}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-xs text-left cursor-pointer transition-colors group"
                    >
                      <FileText size={15} className="text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="hover:underline">{item.documentName}</span>
                    </button>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-600">
                    {item.expiryDate}
                  </td>
                  <td className="py-4 px-4 text-xs font-semibold text-slate-700 tracking-tight">
                    {item.documentType}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    {canManageAssignments ? (
                      <div className="relative inline-block text-left">
                        <select
                          value={item.opsResponsible || 'Sarah Jenkins'}
                          onChange={(e) => handleOpsResponsibleChange(item.id, e.target.value)}
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
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs inline-flex items-center gap-1.5">
                        <UserCheck size={12} className="text-slate-400 shrink-0" />
                        <span>{item.opsResponsible || 'Sarah Jenkins'}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <StatusBadge
                      status={item.status}
                      interactive={true}
                      options={['PENDING', 'VERIFIED', 'UNVERIFIED', 'RESUBMITTED']}
                      onChange={(s) => handleStatusChange(item.id, s)}
                    />
                  </td>
                  <td className="py-4 px-5 text-center">
                    <button
                      onClick={() => {
                        setSelectedDoc(item);
                        setIsPreviewOpen(true);
                      }}
                      className="w-7 h-7 rounded-full border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 inline-flex items-center justify-center transition-colors cursor-pointer"
                      title="Preview Document"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
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
              Showing <span className="font-semibold text-slate-700">1-{filteredDocs.length}</span> of {isAssignedOnly ? filteredDocs.length : 1714}
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-500 font-medium">
            <span className="uppercase text-[11px] font-semibold tracking-wider text-slate-400">
              Page 1 / 172
            </span>
            <div className="flex items-center gap-1">
              <button disabled className="p-1 rounded text-slate-300 cursor-not-allowed">
                <ChevronsLeft size={16} />
              </button>
              <button disabled className="p-1 rounded text-slate-300 cursor-not-allowed">
                <ChevronLeft size={16} />
              </button>
              <button className="p-1 rounded text-slate-600 hover:text-slate-900 cursor-pointer">
                <ChevronRight size={16} />
              </button>
              <button className="p-1 rounded text-slate-600 hover:text-slate-900 cursor-pointer">
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        document={selectedDoc}
        onUpdateStatus={handleStatusChange}
      />
    </div>
  );
};

