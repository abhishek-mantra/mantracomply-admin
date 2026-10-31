export type RoleType = 'SUPER_ADMIN' | 'ADMIN' | 'CREDENTIALING_SPECIALIST' | 'REPRESENTATIVE' | 'ORG ADMIN' | 'PROVIDER' | string;

export interface PermissionSet {
  module: string;
  view: boolean;
  edit: boolean;
  approve: boolean;
  assign: boolean;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  userCount: number;
  dataScope: 'ALL' | 'ASSIGNED_ONLY';
  permissions: PermissionSet[];
}

export interface Persona {
  id: string;
  name: string;
  role: RoleType;
  email: string;
  avatarText: string;
  avatarColor: string;
}

export interface ProviderApplication {
  id: number;
  name: string;
  date: string;
  email: string;
  phone: string;
  organization: string;
  service: string;
  country: string;
  countryFlag: string;
  status: 'DRAFT' | 'NEEDS INFO' | 'APPROVED' | 'SUBMITTED' | 'UNDER REVIEW' | 'REJECTED';
  assignedSpecialist?: string | null;
}

export interface FacilityApplication {
  id: string;
  name: string;
  type: 'GROUP' | 'FACILITY';
  date: string;
  email: string;
  phone: string;
  organization: string;
  service: string;
  country: string;
  countryFlag: string;
  status: 'DRAFT' | 'NEEDS INFO' | 'APPROVED' | 'SUBMITTED' | 'UNDER REVIEW' | 'REJECTED';
  assignedSpecialist?: string | null;
}

export interface DocumentRecord {
  id: string;
  userName: string;
  uploadDate: string;
  documentName: string;
  expiryDate: string;
  documentType: string;
  status: 'PENDING' | 'VERIFIED' | 'UNVERIFIED' | 'RESUBMITTED';
}

export type EnrollmentStatus = 
  | 'Pending'
  | 'On Hold'
  | 'Need Information'
  | 'In Progress'
  | 'Request form Submitted'
  | 'LOI Submitted'
  | 'Network Status Verification'
  | 'Network Close/Not Accepting'
  | 'Submitted'
  | 'Enrolled'
  | 'Rejected'
  | 'Inactive'
  | string;

export const enrollmentStatusOptions: EnrollmentStatus[] = [
  'Pending',
  'On Hold',
  'Need Information',
  'In Progress',
  'Request form Submitted',
  'LOI Submitted',
  'Network Status Verification',
  'Network Close/Not Accepting',
  'Submitted',
  'Enrolled',
  'Rejected',
  'Inactive'
];

export interface ClientActivity {
  id: string;
  type: 'STAGE_UPDATED' | 'CALL_COMPLETED' | 'NOTE_ADDED';
  title: string;
  subtitle?: string;
  badgeText?: string;
  timestamp: string;
}

export interface ClientDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  expiryDate?: string;
  status: 'VERIFIED' | 'PENDING' | 'RESUBMITTED';
  documentNumber?: string;
  uploadedBy?: string;
  size?: string;
}

export interface EnrollmentRecord {
  id: number;
  providerName: string;
  organization: string;
  service: string;
  state: string;
  type: string;
  payer: string;
  priority: 'High' | 'Medium' | 'Low' | 'Standard';
  status: EnrollmentStatus;
  dateOfSubmission: string;
  referenceNumber: string;
  followUpDate: string;
  responsibleUser: string;
  effectiveDate: string;
  recredentialingDate: string;
  providerInsuranceId: string;
  notes: string;

  // Drawer client information & editable details
  email?: string;
  phone?: string;
  timezone?: string;
  category?: string;
  payerNetwork?: string;
  applicationType?: string;
  medicalGroup?: string;
  startDate?: string;
  resubmittedDate?: string;
  approvalDate?: string;
  submissionTimeDays?: number;
  timeToRevalidationDays?: number;
  payerApprovalTimeDays?: number;
  createdBy?: string;
  lastModifiedBy?: string;
  activities?: ClientActivity[];
  documents?: ClientDocument[];

  // Backward-compatibility aliases
  date?: string;
  insurance?: string;
  assignedSpecialist?: string;
}

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  organization: string;
  country: string;
  countryFlag: string;
  service: string;
  signupDate: string;
  role: RoleType;
  status: 'Active' | 'Inactive' | 'Suspended';
  credits: {
    used: number;
    total: number;
  };
}

export const availableSpecialists = [
  "Anshul Gupta01",
  "Sarah Jenkins",
  "David Miller",
  "Alex Chen",
  "Marcus Vance"
];

export const defaultPersonas: Persona[] = [
  {
    id: "p1",
    name: "Abhishek Madaan",
    role: "SUPER_ADMIN",
    email: "abhishek@mantracomply.com",
    avatarText: "A",
    avatarColor: "bg-blue-600"
  },
  {
    id: "p2",
    name: "Anshul Gupta01",
    role: "ADMIN",
    email: "eyemantratirupur04@gmail.com",
    avatarText: "A",
    avatarColor: "bg-indigo-600"
  },
  {
    id: "p3",
    name: "Sarah Jenkins",
    role: "CREDENTIALING_SPECIALIST",
    email: "sarah.j@mantracomply.com",
    avatarText: "S",
    avatarColor: "bg-emerald-600"
  },
  {
    id: "p4",
    name: "David Miller",
    role: "CREDENTIALING_SPECIALIST",
    email: "david.m@mantracomply.com",
    avatarText: "D",
    avatarColor: "bg-teal-600"
  }
];

export const initialRoles: RoleDefinition[] = [
  {
    id: "super_admin",
    name: "SUPER_ADMIN",
    description: "Complete control over the entire platform, including role definition, user role assignments, and all system workflows.",
    isSystem: true,
    userCount: 1,
    dataScope: "ALL",
    permissions: [
      { module: "Credential Applications", view: true, edit: true, approve: true, assign: true },
      { module: "Document Verification", view: true, edit: true, approve: true, assign: true },
      { module: "Enrollment Applications", view: true, edit: true, approve: true, assign: true },
      { module: "User Management", view: true, edit: true, approve: true, assign: true },
      { module: "Plans & Pricing", view: true, edit: true, approve: true, assign: true },
      { module: "Credits Management", view: true, edit: true, approve: true, assign: true },
      { module: "Subscriptions & Orders", view: true, edit: true, approve: true, assign: true }
    ]
  },
  {
    id: "admin",
    name: "ADMIN",
    description: "Platform administrator with broad access to assign any representative, manage applications, and view all specialist requests.",
    isSystem: true,
    userCount: 3,
    dataScope: "ALL",
    permissions: [
      { module: "Credential Applications", view: true, edit: true, approve: true, assign: true },
      { module: "Document Verification", view: true, edit: true, approve: true, assign: true },
      { module: "Enrollment Applications", view: true, edit: true, approve: true, assign: true },
      { module: "User Management", view: true, edit: true, approve: false, assign: true },
      { module: "Plans & Pricing", view: true, edit: false, approve: false, assign: false },
      { module: "Credits Management", view: true, edit: false, approve: false, assign: false },
      { module: "Subscriptions & Orders", view: true, edit: false, approve: false, assign: false }
    ]
  },
  {
    id: "cred_specialist",
    name: "CREDENTIALING_SPECIALIST",
    description: "Representative in charge of verifying documents and managing assigned credentialing and payer enrollment applications.",
    isSystem: true,
    userCount: 8,
    dataScope: "ASSIGNED_ONLY",
    permissions: [
      { module: "Credential Applications", view: true, edit: true, approve: false, assign: false },
      { module: "Document Verification", view: true, edit: true, approve: true, assign: false },
      { module: "Enrollment Applications", view: true, edit: true, approve: false, assign: false },
      { module: "User Management", view: false, edit: false, approve: false, assign: false },
      { module: "Plans & Pricing", view: false, edit: false, approve: false, assign: false },
      { module: "Credits Management", view: false, edit: false, approve: false, assign: false },
      { module: "Subscriptions & Orders", view: false, edit: false, approve: false, assign: false }
    ]
  },
  {
    id: "org_admin",
    name: "ORG ADMIN",
    description: "Organization profile manager with permissions limited to company entities and associated practitioners.",
    isSystem: true,
    userCount: 14,
    dataScope: "ASSIGNED_ONLY",
    permissions: [
      { module: "Credential Applications", view: true, edit: true, approve: false, assign: false },
      { module: "Document Verification", view: true, edit: true, approve: false, assign: false },
      { module: "Enrollment Applications", view: true, edit: true, approve: false, assign: false },
      { module: "User Management", view: false, edit: false, approve: false, assign: false },
      { module: "Plans & Pricing", view: false, edit: false, approve: false, assign: false },
      { module: "Credits Management", view: true, edit: false, approve: false, assign: false },
      { module: "Subscriptions & Orders", view: true, edit: false, approve: false, assign: false }
    ]
  },
  {
    id: "provider",
    name: "PROVIDER",
    description: "Healthcare practitioner access to personal credentialing documents and state license filings.",
    isSystem: true,
    userCount: 961,
    dataScope: "ASSIGNED_ONLY",
    permissions: [
      { module: "Credential Applications", view: true, edit: false, approve: false, assign: false },
      { module: "Document Verification", view: true, edit: true, approve: false, assign: false },
      { module: "Enrollment Applications", view: true, edit: false, approve: false, assign: false },
      { module: "User Management", view: false, edit: false, approve: false, assign: false },
      { module: "Plans & Pricing", view: false, edit: false, approve: false, assign: false },
      { module: "Credits Management", view: false, edit: false, approve: false, assign: false },
      { module: "Subscriptions & Orders", view: false, edit: false, approve: false, assign: false }
    ]
  }
];

export const initialProviders: ProviderApplication[] = [
  { id: 541, name: "Kathleen Diblin", date: "Oct 28, 2026", email: "profslp1929@gmail.com", phone: "+1 6402869150", organization: "MantraCare", service: "SPEECH THERAPIST", country: "United States", countryFlag: "🇺🇸", status: "APPROVED", assignedSpecialist: "Sarah Jenkins" },
  { id: 540, name: "Iris Hines", date: "Oct 27, 2026", email: "hinesiris323@gmail.com", phone: "+1 9123468863", organization: "MantraCare", service: "OTHERSERVICES", country: "United States", countryFlag: "🇺🇸", status: "DRAFT", assignedSpecialist: "David Miller" },
  { id: 539, name: "Prathum", date: "Oct 27, 2026", email: "prathum@mantra.care", phone: "7042955825", organization: "MantraCare", service: "OTHERSERVICES", country: "United States", countryFlag: "🇺🇸", status: "DRAFT", assignedSpecialist: "Anshul Gupta01" },
  { id: 538, name: "Alcira Osayi", date: "Oct 27, 2026", email: "alciraosayi@yahoo.com", phone: "+1 6786222953", organization: "MantraCare", service: "THERAPY", country: "United States", countryFlag: "🇺🇸", status: "DRAFT", assignedSpecialist: null },
  { id: 537, name: "Nick Spinks", date: "Oct 27, 2026", email: "nick.spinks@outlook.com", phone: "+44 7979545964", organization: "MantraCare", service: "THERAPY", country: "United Kingdom", countryFlag: "🇬🇧", status: "DRAFT", assignedSpecialist: null },
  { id: 536, name: "Emily Richards", date: "Oct 27, 2026", email: "drk@lavendervisioncare.com", phone: "5039294442", organization: "Lavender Vision PLLC", service: "OTHERSERVICES", country: "United States", countryFlag: "🇺🇸", status: "DRAFT", assignedSpecialist: null },
  { id: 535, name: "Morgen-Ashlee Backus", date: "Oct 27, 2026", email: "morgenbackusnutrition@gmail....", phone: "+1 8566286679", organization: "MantraCare", service: "DIETITIAN", country: "United States", countryFlag: "🇺🇸", status: "APPROVED", assignedSpecialist: "Sarah Jenkins" },
  { id: 534, name: "John Zavaiydriga", date: "Oct 26, 2026", email: "jjzavaiydriga@gmail.com", phone: "+1 3187803280", organization: "MantraCare", service: "PHYSIOTHERAPY", country: "United States", countryFlag: "🇺🇸", status: "APPROVED", assignedSpecialist: "Sarah Jenkins" },
  { id: 533, name: "Mr Philip Joyce", date: "Oct 26, 2026", email: "phil.joyce13@gmail.com", phone: "+44 07730886536", organization: "MantraCare", service: "THERAPY", country: "United Kingdom", countryFlag: "🇬🇧", status: "DRAFT", assignedSpecialist: null },
  { id: 532, name: "Jodhi Wood Gaudet", date: "Oct 26, 2026", email: "outofthewoodscounselling@outl...", phone: "+1 5145673557", organization: "MantraCare", service: "THERAPY", country: "Canada", countryFlag: "🇨🇦", status: "SUBMITTED", assignedSpecialist: "David Miller" }
];

export const initialFacilities: FacilityApplication[] = [
  { id: "1", name: "Rachel", type: "GROUP", date: "Aug 20, 2026", email: "—", phone: "—", organization: "MantraCare", service: "GROUP_PROFILE", country: "United States", countryFlag: "🇺🇸", status: "DRAFT", assignedSpecialist: "Anshul Gupta01" },
  { id: "2", name: "Rachel", type: "GROUP", date: "Aug 14, 2026", email: "veni@mantra.care", phone: "123", organization: "MantraCare", service: "GROUP_PROFILE", country: "United States", countryFlag: "🇺🇸", status: "UNDER REVIEW", assignedSpecialist: "David Miller" },
  { id: "3", name: "Tabula Rasa Inc", type: "GROUP", date: "Aug 22, 2026", email: "IncTabulaRasa@gmail.com", phone: "605-891-4377", organization: "Tabula Rasa Inc", service: "GROUP_PROFILE", country: "United States", countryFlag: "🇺🇸", status: "DRAFT", assignedSpecialist: null },
  { id: "4", name: "4313046171", type: "FACILITY", date: "Aug 20, 2026", email: "—", phone: "—", organization: "MantraCare", service: "FACILITY", country: "United States", countryFlag: "🇺🇸", status: "REJECTED", assignedSpecialist: null },
  { id: "5", name: "Tabula Rasa Inc", type: "FACILITY", date: "Aug 24, 2026", email: "—", phone: "—", organization: "Tabula Rasa Inc", service: "FACILITY", country: "United States", countryFlag: "🇺🇸", status: "APPROVED", assignedSpecialist: "David Miller" },
  { id: "6", name: "Tabula Rasa Inc", type: "FACILITY", date: "Aug 24, 2026", email: "—", phone: "—", organization: "Tabula Rasa Inc", service: "FACILITY", country: "United States", countryFlag: "🇺🇸", status: "APPROVED", assignedSpecialist: "Sarah Jenkins" },
  { id: "7", name: "adsfd", type: "FACILITY", date: "Aug 22, 2026", email: "—", phone: "—", organization: "Kanak's clinic", service: "FACILITY", country: "United States", countryFlag: "🇺🇸", status: "SUBMITTED", assignedSpecialist: "Anshul Gupta01" }
];

export const initialDocuments: DocumentRecord[] = [
  { id: "d1", userName: "Morgen-Ashlee Backus", uploadDate: "Oct 27, 2026", documentName: "Signed W9 Form", expiryDate: "—", documentType: "DOCUMENT/PDF", status: "RESUBMITTED" },
  { id: "d2", userName: "Morgen-Ashlee Backus", uploadDate: "Oct 27, 2026", documentName: "Diploma Transcript", expiryDate: "—", documentType: "DOCUMENT/PDF", status: "RESUBMITTED" },
  { id: "d3", userName: "Morgen-Ashlee Backus", uploadDate: "Oct 27, 2026", documentName: "Board Certificate", expiryDate: "Dec 31, 2029", documentType: "BOARD CERTIFICATE/PDF", status: "RESUBMITTED" },
  { id: "d4", userName: "Morgen-Ashlee Backus", uploadDate: "Oct 27, 2026", documentName: "License", expiryDate: "Oct 30, 2026", documentType: "LICENSE/PDF", status: "RESUBMITTED" },
  { id: "d5", userName: "Morgen-Ashlee Backus", uploadDate: "Oct 27, 2026", documentName: "Malpractice Insurance", expiryDate: "Jun 26, 2027", documentType: "MALPRACTICE INSURANCE/PDF", status: "RESUBMITTED" },
  { id: "d6", userName: "John Zavaiydriga", uploadDate: "Oct 27, 2026", documentName: "License", expiryDate: "Apr 30, 2027", documentType: "LICENSE/PDF", status: "VERIFIED" },
  { id: "d7", userName: "John Zavaiydriga", uploadDate: "Oct 27, 2026", documentName: "License", expiryDate: "Sep 30, 2028", documentType: "LICENSE/PDF", status: "VERIFIED" },
  { id: "d8", userName: "John Zavaiydriga", uploadDate: "Oct 27, 2026", documentName: "Malpractice Insurance", expiryDate: "Oct 26, 2027", documentType: "MALPRACTICE INSURANCE/PDF", status: "VERIFIED" },
  { id: "d9", userName: "John Zavaiydriga", uploadDate: "Oct 27, 2026", documentName: "Diploma Transcript", expiryDate: "—", documentType: "DOCUMENT/PDF", status: "VERIFIED" },
  { id: "d10", userName: "John Zavaiydriga", uploadDate: "Oct 27, 2026", documentName: "Signed W9 Form", expiryDate: "—", documentType: "DOCUMENT/PDF", status: "VERIFIED" },
  { id: "d11", userName: "Jodhi Wood Gaudet", uploadDate: "Oct 26, 2026", documentName: "Malpractice Insurance", expiryDate: "May 1, 2027", documentType: "MALPRACTICE INSURANCE/PDF", status: "PENDING" }
];

export const initialEnrollments: EnrollmentRecord[] = [
  {
    id: 74,
    providerName: "Veni Jain",
    organization: "MantraCare",
    service: "THERAPY",
    state: "New York (NY)",
    type: "Commercial",
    payer: "Aetna",
    priority: "High",
    status: "Pending",
    dateOfSubmission: "Sep 28, 2026",
    referenceNumber: "REF-AET-99214",
    followUpDate: "Nov 14, 2026",
    responsibleUser: "Sarah Jenkins",
    effectiveDate: "Dec 01, 2026",
    recredentialingDate: "Dec 01, 2028",
    providerInsuranceId: "AET-NY-88492",
    notes: "Submitted via Availity portal on 09/28. Payer acknowledged receipt; awaiting final panel confirmation.",
    date: "Sep 28, 2026",
    insurance: "Aetna",
    assignedSpecialist: "Sarah Jenkins"
  },
  {
    id: 73,
    providerName: "Joanna Sims",
    organization: "MantraCare UK",
    service: "DIETITIAN",
    state: "UK - National",
    type: "Commercial",
    payer: "Vitality",
    priority: "High",
    status: "Enrolled",
    dateOfSubmission: "Sep 8, 2026",
    referenceNumber: "REF-VIT-44012",
    followUpDate: "Oct 20, 2026",
    responsibleUser: "David Miller",
    effectiveDate: "Oct 01, 2026",
    recredentialingDate: "Oct 01, 2028",
    providerInsuranceId: "VIT-UK-44910",
    notes: "Contract executed. Provider recognition code issued and active for direct invoice settlement.",
    date: "Sep 8, 2026",
    insurance: "Vitality",
    assignedSpecialist: "David Miller"
  },
  {
    id: 72,
    providerName: "Joanna Sims",
    organization: "MantraCare UK",
    service: "DIETITIAN",
    state: "UK - National",
    type: "Commercial",
    payer: "WPA",
    priority: "Standard",
    status: "In Progress",
    dateOfSubmission: "Sep 8, 2026",
    referenceNumber: "REF-WPA-22108",
    followUpDate: "Oct 15, 2026",
    responsibleUser: "David Miller",
    effectiveDate: "Sep 25, 2026",
    recredentialingDate: "Sep 25, 2028",
    providerInsuranceId: "WPA-PR-90214",
    notes: "Approved under Dietitian recognized provider roster. Invoicing live.",
    date: "Sep 8, 2026",
    insurance: "WPA",
    assignedSpecialist: "David Miller"
  },
  {
    id: 71,
    providerName: "Joanna Sims",
    organization: "MantraCare UK",
    service: "DIETITIAN",
    state: "UK - National",
    type: "Commercial",
    payer: "Aviva",
    priority: "Standard",
    status: "Submitted",
    dateOfSubmission: "Sep 8, 2026",
    referenceNumber: "REF-AVV-88319",
    followUpDate: "Nov 01, 2026",
    responsibleUser: "David Miller",
    effectiveDate: "Oct 15, 2026",
    recredentialingDate: "Oct 15, 2028",
    providerInsuranceId: "AVV-UK-77312",
    notes: "Fee schedule agreement accepted. Direct settlement enabled.",
    date: "Sep 8, 2026",
    insurance: "Aviva",
    assignedSpecialist: "David Miller"
  },
  {
    id: 70,
    providerName: "Joanna Sims",
    organization: "MantraCare UK",
    service: "DIETITIAN",
    state: "UK - National",
    type: "Commercial",
    payer: "AXA Health",
    priority: "High",
    status: "Request form Submitted",
    dateOfSubmission: "Sep 8, 2026",
    referenceNumber: "REF-AXA-55920",
    followUpDate: "Oct 30, 2026",
    responsibleUser: "Sarah Jenkins",
    effectiveDate: "Oct 01, 2026",
    recredentialingDate: "Oct 01, 2028",
    providerInsuranceId: "AXA-UK-62041",
    notes: "Provider number linked to MantraCare UK clinic group profile.",
    date: "Sep 8, 2026",
    insurance: "AXA Health",
    assignedSpecialist: "Sarah Jenkins"
  },
  {
    id: 69,
    providerName: "Joanna Sims",
    organization: "MantraCare UK",
    service: "DIETITIAN",
    state: "UK - National",
    type: "Commercial",
    payer: "Bupa",
    priority: "High",
    status: "LOI Submitted",
    dateOfSubmission: "Sep 8, 2026",
    referenceNumber: "REF-BUP-11924",
    followUpDate: "Nov 10, 2026",
    responsibleUser: "Sarah Jenkins",
    effectiveDate: "Pending",
    recredentialingDate: "—",
    providerInsuranceId: "BUP-PEND-1029",
    notes: "Application pending background credentialing review with Bupa Medical Panel. Follow-up scheduled for Friday.",
    date: "Sep 8, 2026",
    insurance: "Bupa",
    assignedSpecialist: "Sarah Jenkins"
  },
  {
    id: 68,
    providerName: "Joanna Sims",
    organization: "MantraCare UK",
    service: "DIETITIAN",
    state: "UK - National",
    type: "Commercial",
    payer: "Aviva",
    priority: "Standard",
    status: "Network Status Verification",
    dateOfSubmission: "Sep 8, 2026",
    referenceNumber: "REF-AVV-99120",
    followUpDate: "Nov 05, 2026",
    responsibleUser: "Alex Chen",
    effectiveDate: "Sep 20, 2026",
    recredentialingDate: "Sep 20, 2028",
    providerInsuranceId: "AVV-UK-77312",
    notes: "Contract validated and active.",
    date: "Sep 8, 2026",
    insurance: "Aviva",
    assignedSpecialist: "Alex Chen"
  },
  {
    id: 67,
    providerName: "Rick Baumgartle",
    organization: "MantraCare",
    service: "THERAPY",
    state: "California (CA)",
    type: "Commercial",
    payer: "Aetna",
    priority: "Standard",
    status: "Need Information",
    dateOfSubmission: "Sep 1, 2026",
    referenceNumber: "REF-AET-77192",
    followUpDate: "Dec 01, 2026",
    responsibleUser: "Sarah Jenkins",
    effectiveDate: "Sep 15, 2026",
    recredentialingDate: "Sep 15, 2028",
    providerInsuranceId: "AET-CA-33921",
    notes: "Fully credentialed and loaded in Aetna CA provider directory.",
    date: "Sep 1, 2026",
    insurance: "Aetna",
    assignedSpecialist: "Sarah Jenkins"
  },
  {
    id: 66,
    providerName: "Steven Haag",
    organization: "MantraCare",
    service: "THERAPY",
    state: "Florida (FL)",
    type: "Commercial",
    payer: "Aetna",
    priority: "Standard",
    status: "On Hold",
    dateOfSubmission: "Sep 1, 2026",
    referenceNumber: "REF-AET-66301",
    followUpDate: "Dec 10, 2026",
    responsibleUser: "Anshul Gupta01",
    effectiveDate: "Sep 20, 2026",
    recredentialingDate: "Sep 20, 2028",
    providerInsuranceId: "AET-FL-55102",
    notes: "Active in-network provider.",
    date: "Sep 1, 2026",
    insurance: "Aetna",
    assignedSpecialist: "Anshul Gupta01"
  },
  {
    id: 65,
    providerName: "Rick Baumgartle",
    organization: "MantraCare",
    service: "THERAPY",
    state: "Texas (TX)",
    type: "Commercial",
    payer: "Aetna",
    priority: "Medium",
    status: "Network Close/Not Accepting",
    dateOfSubmission: "Aug 20, 2026",
    referenceNumber: "REF-AET-33290",
    followUpDate: "Nov 18, 2026",
    responsibleUser: "Alex Chen",
    effectiveDate: "Pending",
    recredentialingDate: "—",
    providerInsuranceId: "AET-TX-PEND-09",
    notes: "Initial contracting packet submitted to Texas contracting committee. Awaiting response.",
    date: "Aug 20, 2026",
    insurance: "Aetna",
    assignedSpecialist: "Alex Chen"
  }
];

export const initialUsers: UserRecord[] = [
  { id: 1031, name: "Anshul Gupta01", email: "eyemantratirupur04@gmail.com", phone: "+1 6502391024", organization: "MantraCare", country: "United States", countryFlag: "🇺🇸", service: "OPERATIONS", signupDate: "Aug 10, 2026", role: "ADMIN", status: "Active", credits: { used: 0, total: 0 } },
  { id: 1030, name: "Parker Layne", email: "parkerlayne77@gmail.com", phone: "+1 4342034048", organization: "MantraCare", country: "United States", countryFlag: "🇺🇸", service: "—", signupDate: "Oct 27, 2026", role: "PROVIDER", status: "Active", credits: { used: 0, total: 0 } },
  { id: 1029, name: "Sophia Kariotaki", email: "skariotaki@yahoo.com", phone: "+44 07593236943", organization: "MantraCare", country: "United Kingdom", countryFlag: "🇬🇧", service: "—", signupDate: "Oct 27, 2026", role: "CREDENTIALING_SPECIALIST", status: "Active", credits: { used: 0, total: 0 } },
  { id: 1028, name: "Tracey Rowlands", email: "tracey700@aol.com", phone: "+44 07753511109", organization: "MantraCare", country: "United Kingdom", countryFlag: "🇬🇧", service: "—", signupDate: "Oct 27, 2026", role: "PROVIDER", status: "Active", credits: { used: 0, total: 0 } },
  { id: 1027, name: "Elizabeth Self Lingle", email: "lizzyself002@gmail.com", phone: "+1 6019415803", organization: "MantraCare", country: "United States", countryFlag: "🇺🇸", service: "—", signupDate: "Oct 27, 2026", role: "PROVIDER", status: "Active", credits: { used: 0, total: 0 } },
  { id: 1026, name: "Nicole Jean Magpayo", email: "nicolemagpayo3@gmail.com", phone: "+63 9164641521", organization: "MantraCare", country: "Philippines", countryFlag: "🇵🇭", service: "—", signupDate: "Oct 27, 2026", role: "ADMIN", status: "Active", credits: { used: 0, total: 0 } },
  { id: 1025, name: "Kathleen Diblin", email: "profslp1929@gmail.com", phone: "+1 6402869150", organization: "MantraCare", country: "United States", countryFlag: "🇺🇸", service: "SPEECH THERAPIST", signupDate: "Oct 27, 2026", role: "PROVIDER", status: "Active", credits: { used: 0, total: 0 } },
  { id: 1024, name: "Princesa Cardenas", email: "blossom02pyc@gmail.com", phone: "+1 5402215732", organization: "MantraCare", country: "United States", countryFlag: "🇺🇸", service: "—", signupDate: "Oct 27, 2026", role: "CREDENTIALING_SPECIALIST", status: "Active", credits: { used: 0, total: 0 } },
  { id: 1023, name: "Alcira Osayi", email: "alciraosayi@yahoo.com", phone: "+1 6786222953", organization: "MantraCare", country: "United States", countryFlag: "🇺🇸", service: "THERAPY", signupDate: "Oct 27, 2026", role: "PROVIDER", status: "Active", credits: { used: 0, total: 0 } },
  { id: 1022, name: "Kayla Sitton", email: "kaylasitton432@gmail.com", phone: "+1 9702164307", organization: "MantraCare", country: "United States", countryFlag: "🇺🇸", service: "—", signupDate: "Oct 27, 2026", role: "ADMIN", status: "Active", credits: { used: 0, total: 0 } },
  { id: 1021, name: "Nick Spinks", email: "nick.spinks@outlook.com", phone: "+44 7979545964", organization: "MantraCare", country: "United Kingdom", countryFlag: "🇬🇧", service: "THERAPY", signupDate: "Oct 27, 2026", role: "PROVIDER", status: "Active", credits: { used: 0, total: 0 } },
  { id: 1020, name: "Emily Richards", email: "drk@lavendervisioncare.com", phone: "5039294442", organization: "Lavender Vision PLLC", country: "United States", countryFlag: "🇺🇸", service: "OTHERSERVICES", signupDate: "Oct 27, 2026", role: "ORG ADMIN", status: "Active", credits: { used: 0, total: 0 } }
];
