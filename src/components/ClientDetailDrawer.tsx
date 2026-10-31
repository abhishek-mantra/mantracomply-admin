import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Trash2, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  MessageSquare, 
  Info, 
  User, 
  Search 
} from 'lucide-react';
import { EnrollmentRecord, availableSpecialists, ClientActivity, ClientDocument } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { PipelineStageBar } from './PipelineStageBar';

interface ClientDetailDrawerProps {
  client: EnrollmentRecord;
  onClose: () => void;
  onUpdate: (updatedClient: EnrollmentRecord) => void;
  onOpenNewEnrollment?: () => void;
}

export const ClientDetailDrawer: React.FC<ClientDetailDrawerProps> = ({
  client,
  onClose,
  onUpdate,
  onOpenNewEnrollment
}) => {
  const { sidebarCollapsed } = useApp();
  const [activeTab, setActiveTab] = useState<'general' | 'enrollments' | 'documents'>('general');

  // Form states for General tab (Left column)
  const [name, setName] = useState(client.providerName);
  const [category, setCategory] = useState(client.category || 'Providers');
  const [email, setEmail] = useState(client.email || `${client.providerName.toLowerCase().replace(/\s+/g, '.')}@mantra.care`);
  const [phone, setPhone] = useState(client.phone || '+1 6402869150');
  const [timezone, setTimezone] = useState(client.timezone || 'America/New_York (EST)');
  const [source, setSource] = useState('Credential Applications');
  const [inquiryType, setInquiryType] = useState(client.service || 'THERAPY');
  const [organization, setOrganization] = useState(client.organization || 'MantraCare');
  const [stateName, setStateName] = useState(client.state || 'New York (NY)');
  const [referenceNumber, setReferenceNumber] = useState(client.referenceNumber || 'REF-AET-99214');

  // Payer Details (Screenshot 3)
  const [payer, setPayer] = useState(client.payer || client.insurance || 'Aetna');
  const [payerNetwork, setPayerNetwork] = useState(client.payerNetwork || `${client.payer} Medicare Advantage`);
  const [planType, setPlanType] = useState(client.type || 'Commercial');
  const [applicationType, setApplicationType] = useState(client.applicationType || 'Online Roster');
  const [medicalGroup, setMedicalGroup] = useState(client.medicalGroup || `${client.organization} Medical Group`);

  // Dates (Screenshot 3)
  const [startDate, setStartDate] = useState(client.startDate || '09/15/2026');
  const [submissionDate, setSubmissionDate] = useState(client.dateOfSubmission || client.date || '10/22/2026');
  const [approvalDate, setApprovalDate] = useState(client.approvalDate || '10/30/2026');
  const [resubmittedDate, setResubmittedDate] = useState(client.resubmittedDate || '—');
  const [revalidationDate, setRevalidationDate] = useState(client.recredentialingDate || '09/28/2028');
  const [effectiveDate, setEffectiveDate] = useState(client.effectiveDate || '09/29/2026');
  const [followUpDate, setFollowUpDate] = useState(client.followUpDate || '11/14/2026');

  // Collapsible sections state
  const [payerDetailsOpen, setPayerDetailsOpen] = useState(true);
  const [datesOpen, setDatesOpen] = useState(true);
  const [analyticsOpen, setAnalyticsOpen] = useState(true);
  const [systemInfoOpen, setSystemInfoOpen] = useState(true);

  // Status & Responsible
  const [currentStatus, setCurrentStatus] = useState<string>(client.status);
  const [responsibleUser, setResponsibleUser] = useState(client.responsibleUser || client.assignedSpecialist || availableSpecialists[0]);

  // Activity & Notes state (Right column)
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState<'ACTIVITY' | 'NOTE'>('NOTE');
  const [activities, setActivities] = useState<ClientActivity[]>(client.activities || [
    {
      id: 'act-1',
      type: 'STAGE_UPDATED',
      title: 'Stage Updated',
      subtitle: `${client.status} via Pipeline Automation • Payer Portal Queue`,
      badgeText: client.status,
      timestamp: 'Oct 31, 2026, 2:58 PM'
    },
    {
      id: 'act-2',
      type: 'CALL_COMPLETED',
      title: 'Outbound Call Completed',
      subtitle: 'Scheduled via Voice Assistant with Provider Relations',
      timestamp: 'Oct 31, 2026, 2:58 PM'
    },
    {
      id: 'act-3',
      type: 'NOTE_ADDED',
      title: 'Note Added',
      subtitle: `Note by System Specialist: ${client.notes || 'Client application created and assigned.'}`,
      timestamp: 'Oct 31, 2026, 2:58 PM'
    }
  ]);

  // Documents state (Tab 3 matching Image 1)
  const [documents, setDocuments] = useState<ClientDocument[]>(client.documents || [
    { 
      id: 'doc-1', 
      name: 'Signed_W9_Tax_Form.pdf', 
      documentNumber: 'DOC-892147',
      uploadedBy: 'Sarah Jenkins',
      uploadDate: 'Oct 28, 2026', 
      size: '1.4 MB', 
      type: 'DOCUMENT/PDF', 
      status: 'VERIFIED' 
    },
    { 
      id: 'doc-2', 
      name: 'State_Medical_License.pdf', 
      documentNumber: 'DOC-892148',
      uploadedBy: 'David Miller',
      uploadDate: 'Oct 28, 2026', 
      size: '2.8 MB', 
      type: 'LICENSE/PDF', 
      status: 'VERIFIED' 
    },
    { 
      id: 'doc-3', 
      name: 'Malpractice_COI_Certificate.pdf', 
      documentNumber: 'DOC-892149',
      uploadedBy: 'Sarah Jenkins',
      uploadDate: 'Oct 28, 2026', 
      size: '950 KB', 
      type: 'MALPRACTICE/PDF', 
      status: 'VERIFIED' 
    }
  ]);
  const [docSearch, setDocSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);

  // Save changes handler
  const handleSaveGeneral = () => {
    const updated: EnrollmentRecord = {
      ...client,
      providerName: name,
      category,
      email,
      phone,
      timezone,
      service: inquiryType,
      organization,
      state: stateName,
      referenceNumber,
      payer,
      insurance: payer,
      payerNetwork,
      type: planType,
      applicationType,
      medicalGroup,
      startDate,
      dateOfSubmission: submissionDate,
      date: submissionDate,
      approvalDate,
      resubmittedDate,
      recredentialingDate: revalidationDate,
      effectiveDate,
      followUpDate,
      status: currentStatus as any,
      responsibleUser,
      assignedSpecialist: responsibleUser,
      activities,
      documents
    };

    onUpdate(updated);
    setSaveSuccessMessage(true);
    setTimeout(() => setSaveSuccessMessage(false), 3000);
  };

  // Add new activity / note
  const handlePostActivity = () => {
    if (!noteText.trim()) return;

    const newAct: ClientActivity = {
      id: `act-${Date.now()}`,
      type: noteType === 'NOTE' ? 'NOTE_ADDED' : 'STAGE_UPDATED',
      title: noteType === 'NOTE' ? 'Note Added' : 'Activity Recorded',
      subtitle: `Note by Specialist: ${noteText.trim()}`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })
    };

    const updatedActs = [newAct, ...activities];
    setActivities(updatedActs);
    setNoteText('');

    onUpdate({
      ...client,
      activities: updatedActs,
      notes: noteText.trim()
    });
  };

  // Handle stage change from PipelineStageBar
  const handleStageChange = (newStage: string) => {
    setCurrentStatus(newStage);

    const stageAct: ClientActivity = {
      id: `act-${Date.now()}`,
      type: 'STAGE_UPDATED',
      title: 'Stage Updated',
      subtitle: `${newStage} via Pipeline Workflow`,
      badgeText: newStage,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })
    };

    const updatedActs = [stageAct, ...activities];
    setActivities(updatedActs);

    onUpdate({
      ...client,
      status: newStage as any,
      activities: updatedActs
    });
  };

  // Direct File Upload handler ("upload and then u just upload" - Image 1)
  const handleDirectFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const newDocs: ClientDocument[] = files.map((f, i) => {
      const sizeStr = f.size > 1024 * 1024 
        ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.max(1, Math.round(f.size / 1024))} KB`;
      return {
        id: `doc-${Date.now()}-${i}`,
        name: f.name,
        type: f.name.endsWith('.pdf') ? 'DOCUMENT/PDF' : (f.type || 'DOCUMENT/PDF'),
        uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        documentNumber: `DOC-${Math.floor(100000 + Math.random() * 900000)}`,
        uploadedBy: responsibleUser || 'Sarah Jenkins',
        size: sizeStr,
        status: 'VERIFIED'
      };
    });

    const updatedDocs = [...newDocs, ...documents];
    setDocuments(updatedDocs);

    const newAct: ClientActivity = {
      id: `act-${Date.now()}`,
      type: 'NOTE_ADDED',
      title: 'Document Uploaded',
      subtitle: `Uploaded ${files.length} document(s): ${files.map(f => f.name).join(', ')}`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })
    };
    const updatedActs = [newAct, ...activities];
    setActivities(updatedActs);

    onUpdate({
      ...client,
      documents: updatedDocs,
      activities: updatedActs
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filtered documents matching search query
  const filteredDocs = React.useMemo(() => {
    if (!docSearch.trim()) return documents;
    const q = docSearch.toLowerCase();
    return documents.filter(d => 
      d.name.toLowerCase().includes(q) || 
      (d.documentNumber || '').toLowerCase().includes(q) ||
      (d.uploadedBy || '').toLowerCase().includes(q)
    );
  }, [documents, docSearch]);

  return createPortal(
    <div className="fixed inset-0 z-[100] pointer-events-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[90] transition-opacity cursor-pointer"
        onClick={onClose}
      />

      {/* Slide-in Drawer Container: Starts exactly at the sidebar right edge ("till here") to the right edge of the screen */}
      <div 
        className={`fixed inset-y-0 right-0 z-[100] bg-[#f8fafc] shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200 overflow-hidden ${
          sidebarCollapsed ? 'left-0 md:left-20' : 'left-0 md:left-64'
        }`}
      >
        
        {/* TOP HEADER (matching Screenshot 2 & 4) */}
        <div className="bg-white border-b border-slate-200 px-6 pt-5 pb-0 shadow-2xs">
          <div className="flex items-center justify-between pb-4">
            {/* Provider Avatar & Identity */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{name}</h2>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-100 uppercase">
                    {inquiryType}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {phone} • {organization} • Ref #{referenceNumber}
                </p>
              </div>
            </div>

            {/* Action Buttons: Delete & Red Close Button (Screenshot 2) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-8 h-8 rounded-full border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                title="Delete Record"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${name}'s enrollment record?`)) {
                    onClose();
                  }
                }}
              >
                <Trash2 size={15} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                title="Close Drawer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* 3 Drawer Tabs: General, Enrollments, Documents */}
          <div className="flex items-center gap-8 -mb-px">
            <button
              onClick={() => setActiveTab('general')}
              className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
                activeTab === 'general'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('enrollments')}
              className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'enrollments'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Enrollments</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">1</span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'documents'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Documents</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">{documents.length}</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENTS (Scrollable area) */}
        <div className="flex-1 overflow-y-auto">

          {/* ======================================================== */}
          {/* TAB 1: GENERAL (Screenshots 2 & 3 - Left Editable, Right Activity) */}
          {/* ======================================================== */}
          {activeTab === 'general' && (
            <div className="p-6">
              {saveSuccessMessage && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Changes saved successfully to provider profile and active enrollment!</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COLUMN: Editable Info (lg:col-span-7) */}
                <div className="lg:col-span-7 space-y-5">
                  
                  {/* Card: ABOUT */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">About</h3>
                      <span className="text-[10px] text-slate-400 font-semibold">Editable Fields</span>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Name */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Phone
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>

                      {/* Organization */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Organization
                        </label>
                        <input
                          type="text"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white font-medium"
                        />
                      </div>

                      {/* State / Jurisdiction */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          State / Jurisdiction
                        </label>
                        <input
                          type="text"
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>

                      {/* Timezone */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Timezone
                        </label>
                        <select
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                        >
                          <option value="America/New_York (EST)">America/New_York (EST)</option>
                          <option value="America/Chicago (CST)">America/Chicago (CST)</option>
                          <option value="America/Denver (MST)">America/Denver (MST)</option>
                          <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                          <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                        </select>
                      </div>

                      {/* Source */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Source
                        </label>
                        <input
                          type="text"
                          value={source}
                          onChange={(e) => setSource(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>

                      {/* Inquiry Type / Service */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Inquiry Type / Service
                        </label>
                        <input
                          type="text"
                          value={inquiryType}
                          onChange={(e) => setInquiryType(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white uppercase font-semibold text-blue-700"
                        />
                      </div>

                      {/* Created At */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Created At
                        </label>
                        <input
                          type="text"
                          disabled
                          value="October 31, 2026"
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-500 bg-slate-50 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card: PAYER DETAILS (Screenshot 3) */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setPayerDetailsOpen(!payerDetailsOpen)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        {payerDetailsOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                        Payer Details
                      </span>
                      <span className="text-[10px] text-blue-600 font-semibold">{payer}</span>
                    </button>

                    {payerDetailsOpen && (
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Payer
                          </label>
                          <input
                            type="text"
                            value={payer}
                            onChange={(e) => setPayer(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Payer Network
                          </label>
                          <input
                            type="text"
                            value={payerNetwork}
                            onChange={(e) => setPayerNetwork(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Plan Type
                          </label>
                          <select
                            value={planType}
                            onChange={(e) => setPlanType(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer bg-white"
                          >
                            <option value="Commercial">Commercial</option>
                            <option value="Medicare">Medicare</option>
                            <option value="Medicaid">Medicaid</option>
                            <option value="Managed Care">Managed Care</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Application Type
                          </label>
                          <input
                            type="text"
                            value={applicationType}
                            onChange={(e) => setApplicationType(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Reference Number
                          </label>
                          <input
                            type="text"
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Medical Group
                          </label>
                          <input
                            type="text"
                            value={medicalGroup}
                            onChange={(e) => setMedicalGroup(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card: DATES (Screenshot 3) */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setDatesOpen(!datesOpen)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        {datesOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                        Dates
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Timeline Milestones</span>
                    </button>

                    {datesOpen && (
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Start Date
                          </label>
                          <input
                            type="text"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Resubmitted Date
                          </label>
                          <input
                            type="text"
                            value={resubmittedDate}
                            onChange={(e) => setResubmittedDate(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Submission Date
                          </label>
                          <input
                            type="text"
                            value={submissionDate}
                            onChange={(e) => setSubmissionDate(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Revalidation Date
                          </label>
                          <input
                            type="text"
                            value={revalidationDate}
                            onChange={(e) => setRevalidationDate(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Approval Date
                          </label>
                          <input
                            type="text"
                            value={approvalDate}
                            onChange={(e) => setApprovalDate(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 text-emerald-700 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Effective Date
                          </label>
                          <input
                            type="text"
                            value={effectiveDate}
                            onChange={(e) => setEffectiveDate(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 text-blue-700 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Follow Up Date
                          </label>
                          <input
                            type="text"
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card: ANALYTICS (Screenshot 3) */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setAnalyticsOpen(!analyticsOpen)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        {analyticsOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                        Analytics
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Turnaround Metrics</span>
                    </button>

                    {analyticsOpen && (
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            <span>Submission Time</span>
                            <Info size={12} className="text-slate-400" />
                          </div>
                          <div className="text-xl font-bold text-slate-900">37 <span className="text-xs font-normal text-slate-400">days</span></div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            <span>Time to Revalidation</span>
                            <Info size={12} className="text-slate-400" />
                          </div>
                          <div className="text-xl font-bold text-slate-900">702 <span className="text-xs font-normal text-slate-400">days</span></div>
                        </div>

                        <div className="md:col-span-2 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            <span>Payer Approval Time</span>
                            <Info size={12} className="text-slate-400" />
                          </div>
                          <div className="text-xl font-bold text-blue-600">8 <span className="text-xs font-normal text-slate-400">days turnaround</span></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card: SYSTEM INFORMATION (Screenshot 3) */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setSystemInfoOpen(!systemInfoOpen)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        {systemInfoOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                        System Information
                      </span>
                    </button>

                    {systemInfoOpen && (
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                        <div>
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Created By</div>
                          <div className="flex items-center gap-2 font-medium text-slate-800">
                            <User size={13} className="text-slate-400" />
                            <span>Sarah Jenkins, 9/10/2026, 8:44 AM</span>
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Last Modified By</div>
                          <div className="flex items-center gap-2 font-medium text-slate-800">
                            <User size={13} className="text-slate-400" />
                            <span>David Miller, 10/23/2026, 10:10 AM</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Save Changes Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveGeneral}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={15} />
                      Save Client Information
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: Activity & Notes Module (Screenshot 2) (lg:col-span-5) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Top Textbox: Record New Client Activity or Note */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                    <textarea
                      rows={3}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Record new client activity or note..."
                      className="w-full p-3 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none bg-slate-50/50"
                    />

                    <div className="flex items-center justify-between pt-1">
                      {/* Pill toggle: ACTIVITY vs NOTE */}
                      <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setNoteType('ACTIVITY')}
                          className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                            noteType === 'ACTIVITY' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
                          }`}
                        >
                          ACTIVITY
                        </button>
                        <button
                          type="button"
                          onClick={() => setNoteType('NOTE')}
                          className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                            noteType === 'NOTE' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
                          }`}
                        >
                          NOTE
                        </button>
                      </div>

                      {/* Post Button */}
                      <button
                        type="button"
                        onClick={handlePostActivity}
                        disabled={!noteText.trim()}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                      >
                        <Send size={12} />
                        Post
                      </button>
                    </div>
                  </div>

                  {/* Activity Timeline List (Screenshot 2) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Activity Timeline ({activities.length})
                      </div>
                      <button className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer">
                        <span>All Events</span>
                        <ChevronDown size={12} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {activities.map((act) => {
                        let iconColor = 'bg-blue-600 text-white';
                        let IconComponent = Clock;
                        if (act.type === 'CALL_COMPLETED') {
                          iconColor = 'bg-emerald-600 text-white';
                          IconComponent = PhoneCall;
                        } else if (act.type === 'NOTE_ADDED') {
                          iconColor = 'bg-purple-600 text-white';
                          IconComponent = MessageSquare;
                        }

                        return (
                          <div key={act.id} className="flex items-start gap-3 text-xs">
                            <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center ${iconColor} shadow-2xs mt-0.5`}>
                              <IconComponent size={13} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-slate-900 truncate">{act.title}</span>
                                <span className="text-[10px] text-slate-400 shrink-0 font-medium">{act.timestamp}</span>
                              </div>
                              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed break-words">
                                {act.subtitle}
                              </p>
                              {act.badgeText && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold text-[10px] rounded border border-blue-100 uppercase">
                                  {act.badgeText}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: ENROLLMENTS (PROCESSES) (Screenshot 4) */}
          {/* ======================================================== */}
          {activeTab === 'enrollments' && (
            <div className="p-6 space-y-4">
              {/* Top Header Row */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Assigned Processes (1)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Active payer enrollment workflows and stage pipeline.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenNewEnrollment) {
                      onOpenNewEnrollment();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>+ Assign Process (New Enrollment)</span>
                </button>
              </div>

              {/* Table (matching Screenshot 4 with dark navy header) */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#002B49] text-white text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-3 w-8 text-center border-r border-[#1a4a6e]">
                        <input type="checkbox" className="rounded" />
                      </th>
                      <th className="py-3 px-3 w-8 text-center border-r border-[#1a4a6e]">
                        ⚙
                      </th>
                      <th className="py-3 px-4 border-r border-[#1a4a6e]">
                        Process
                      </th>
                      <th className="py-3 px-4 min-w-[200px] border-r border-[#1a4a6e]">
                        Stage
                      </th>
                      <th className="py-3 px-4 border-r border-[#1a4a6e]">
                        Created At
                      </th>
                      <th className="py-3 px-4 border-r border-[#1a4a6e]">
                        Activity
                      </th>
                      <th className="py-3 px-4">
                        Responsible
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center">
                        <input type="checkbox" className="rounded text-blue-600" />
                      </td>
                      <td className="py-3 px-3 text-center text-slate-400">
                        ≡
                      </td>
                      <td className="py-3 px-4 font-semibold text-blue-600 hover:underline cursor-pointer">
                        {payer} {planType} Enrollment - {referenceNumber}
                      </td>
                      <td className="py-3 px-4">
                        {/* Segmented Pipeline Progress Bar (Screenshot 1 & 4) */}
                        <PipelineStageBar
                          status={currentStatus}
                          onChange={handleStageChange}
                        />
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {submissionDate}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        Last update - Oct 31 • System Activity
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={responsibleUser}
                          onChange={(e) => {
                            setResponsibleUser(e.target.value);
                            onUpdate({ ...client, responsibleUser: e.target.value, assignedSpecialist: e.target.value });
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
                        >
                          {availableSpecialists.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: DOCUMENTS (Matching Screenshot Image 1) */}
          {/* ======================================================== */}
          {activeTab === 'documents' && (
            <div className="p-6 space-y-4">
              {/* Header Row matching Image 1: CLIENT DOCUMENTS (N) & Right Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  CLIENT DOCUMENTS ({filteredDocs.length})
                </div>

                <div className="flex items-center gap-3">
                  {/* Search bar */}
                  <div className="relative">
                    <Search size={14} className="text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={docSearch}
                      onChange={(e) => setDocSearch(e.target.value)}
                      placeholder="Search documents..."
                      className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-500 w-52 text-slate-700"
                    />
                  </div>

                  {/* Hidden File Input for direct upload */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleDirectFileUpload}
                    multiple
                    className="hidden"
                  />

                  {/* Dark "+ Upload / Generate" button matching Image 1 */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#001f35] hover:bg-[#002b49] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>+ Upload / Generate</span>
                  </button>
                </div>
              </div>

              {/* Table with Dark Navy Header matching Image 1 */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#002B49] text-white text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-3 w-10 text-center border-r border-[#1a4a6e]">
                        <input type="checkbox" className="rounded" />
                      </th>
                      <th className="py-3 px-3 w-10 text-center border-r border-[#1a4a6e]">
                        ⚙
                      </th>
                      <th className="py-3 px-4 border-r border-[#1a4a6e]">
                        DOCUMENT NUMBER
                      </th>
                      <th className="py-3 px-4 border-r border-[#1a4a6e]">
                        DOCUMENT NAME
                      </th>
                      <th className="py-3 px-4 border-r border-[#1a4a6e]">
                        UPLOADED BY
                      </th>
                      <th className="py-3 px-4 border-r border-[#1a4a6e]">
                        DATE
                      </th>
                      <th className="py-3 px-4 border-r border-[#1a4a6e]">
                        SIZE
                      </th>
                      <th className="py-3 px-4 text-center">
                        ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredDocs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <p className="text-xs text-slate-500 font-medium">
                              No documents found. Upload a file or generate one from a template.
                            </p>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="mt-1 text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                            >
                              Click to select file and upload directly
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredDocs.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 text-center">
                            <input type="checkbox" className="rounded text-blue-600" />
                          </td>
                          <td className="py-3 px-3 text-center text-slate-400">
                            <FileText size={14} />
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                            {doc.documentNumber || `DOC-${doc.id}`}
                          </td>
                          <td className="py-3 px-4 font-semibold text-blue-600 hover:underline cursor-pointer">
                            {doc.name}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {doc.uploadedBy || responsibleUser}
                          </td>
                          <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                            {doc.uploadDate}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                            {doc.size || '1.4 MB'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = documents.filter(d => d.id !== doc.id);
                                setDocuments(updated);
                                onUpdate({ ...client, documents: updated });
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete document"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>,
    document.body
  );
};
