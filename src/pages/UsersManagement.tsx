import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Settings, 
  Menu, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Plus,
  X,
  Users as UsersIcon,
  Check,
  Building2,
  User as UserIcon,
  UserCheck,
  GripVertical,
  Shield,
  Edit3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RoleDefinition, RoleType, availableSpecialists, availableOrganizations, UserRecord } from '../data/mockData';

const complianceModules = [
  "Credential Applications",
  "Document Verification",
  "Enrollment Applications",
  "User Management",
  "Plans & Pricing",
  "Credits Management",
  "Subscriptions & Orders"
];

type PermissionLevel = 'none' | 'view' | 'view_edit' | 'full';

interface ColumnDef {
  id: string;
  label: string;
  visible: boolean;
  minWidth?: string;
}

const DEFAULT_USER_COLUMNS: ColumnDef[] = [
  { id: 'email', label: 'Email', visible: true, minWidth: '220px' },
  { id: 'phone', label: 'Phone', visible: true, minWidth: '150px' },
  { id: 'organization', label: 'Organization', visible: true, minWidth: '200px' },
  { id: 'country', label: 'Country', visible: true, minWidth: '150px' },
  { id: 'service', label: 'Service', visible: true, minWidth: '160px' },
  { id: 'referredBy', label: 'Referred by', visible: true, minWidth: '160px' },
  { id: 'onboardedBy', label: 'Onboarded by', visible: true, minWidth: '160px' },
  { id: 'opsResponsible', label: 'Ops Responsible', visible: true, minWidth: '190px' },
  { id: 'credentialingStartDate', label: 'Credentialing start date', visible: true, minWidth: '170px' },
  { id: 'enrollmentStartDate', label: 'Enrollment start date', visible: true, minWidth: '170px' },
  { id: 'signupDate', label: 'Signup Date', visible: true, minWidth: '130px' },
  { id: 'role', label: 'Role', visible: true, minWidth: '140px' }
];

export const UsersManagement: React.FC = () => {
  const { 
    users, 
    roles, 
    createRole, 
    updateRole,
    addUser,
    updateUser,
    assignUserSpecialist,
    updateUserOrganizations
  } = useApp();

  // Primary tab: 'users' matches screenshot target
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  
  // Organization Multi-Select Filter state
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [isOrgFilterOpen, setIsOrgFilterOpen] = useState(false);
  const [orgFilterSearch, setOrgFilterSearch] = useState('');
  const orgFilterRef = useRef<HTMLDivElement>(null);

  // Quick inline org edit dropdown state for a user
  const [editingUserOrgsId, setEditingUserOrgsId] = useState<number | null>(null);
  const userOrgPopoverRef = useRef<HTMLDivElement>(null);

  // Hamburger Action Menu state
  const [openMenuUserId, setOpenMenuUserId] = useState<number | null>(null);

  // Edit User Modal State
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<RoleType>('PROVIDER');
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive' | 'Suspended'>('Active');
  const [editCountry, setEditCountry] = useState('United States');
  const [editService, setEditService] = useState('THERAPY');
  const [editOrgs, setEditOrgs] = useState<string[]>(['MantraCare']);
  const [editReferredBy, setEditReferredBy] = useState('');
  const [editOnboardedBy, setEditOnboardedBy] = useState('');
  const [editOpsResponsible, setEditOpsResponsible] = useState('Sarah Jenkins');
  const [editCredStartDate, setEditCredStartDate] = useState('');
  const [editEnrollStartDate, setEditEnrollStartDate] = useState('');

  const handleOpenEditUser = (user: UserRecord) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditRole(user.role);
    setEditStatus(user.status || 'Active');
    setEditCountry(user.country || 'United States');
    setEditService(user.service || 'THERAPY');
    setEditOrgs(user.organizations && user.organizations.length > 0 ? [...user.organizations] : [user.organization || 'MantraCare']);
    setEditReferredBy(user.referredBy || 'Portal (Direct)');
    setEditOnboardedBy(user.onboardedBy || 'Sarah Jenkins');
    setEditOpsResponsible(user.opsResponsible || availableSpecialists[0]);
    setEditCredStartDate(user.credentialingStartDate || 'Oct 29, 2026');
    setEditEnrollStartDate(user.enrollmentStartDate || 'Pending');
    setOpenMenuUserId(null);
    setIsEditUserModalOpen(true);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editName.trim() || !editEmail.trim()) return;

    updateUser(editingUser.id, {
      name: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      role: editRole,
      status: editStatus,
      country: editCountry,
      countryFlag: editCountry === 'Canada' ? '🇨🇦' : editCountry === 'United Kingdom' ? '🇬🇧' : '🇺🇸',
      service: editService.trim(),
      organization: editOrgs[0] || 'MantraCare',
      organizations: editOrgs.length > 0 ? editOrgs : ['MantraCare'],
      referredBy: editReferredBy.trim(),
      onboardedBy: editOnboardedBy.trim(),
      opsResponsible: editOpsResponsible,
      credentialingStartDate: editCredStartDate.trim(),
      enrollmentStartDate: editEnrollStartDate.trim()
    });

    setIsEditUserModalOpen(false);
    setEditingUser(null);
  };

  // Column Settings Dialog State
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  const [draggedColumnIdx, setDraggedColumnIdx] = useState<number | null>(null);
  const [columns, setColumns] = useState<ColumnDef[]>(() => {
    try {
      const saved = localStorage.getItem('mantra_users_columns');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_USER_COLUMNS;
  });

  const visibleColumns = useMemo(() => columns.filter(c => c.visible), [columns]);

  const toggleColumnVisibility = (id: string) => {
    setColumns(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c);
      try { localStorage.setItem('mantra_users_columns', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const reorderColumns = (fromIdx: number, toIdx: number) => {
    setColumns(prev => {
      const list = [...prev];
      const [moved] = list.splice(fromIdx, 1);
      list.splice(toIdx, 0, moved);
      try { localStorage.setItem('mantra_users_columns', JSON.stringify(list)); } catch {}
      return list;
    });
  };

  const resetColumns = () => {
    setColumns(DEFAULT_USER_COLUMNS);
    try { localStorage.removeItem('mantra_users_columns'); } catch {}
  };

  // Close popovers on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (orgFilterRef.current && !orgFilterRef.current.contains(e.target as Node)) {
        setIsOrgFilterOpen(false);
      }
      if (userOrgPopoverRef.current && !userOrgPopoverRef.current.contains(e.target as Node)) {
        setEditingUserOrgsId(null);
      }
      setOpenMenuUserId(null);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filtered Users with Multi-Select Org matching
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const userOrgs = u.organizations && u.organizations.length > 0 ? u.organizations : [u.organization];
      const matchesSearch = 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phone && u.phone.includes(searchTerm)) ||
        (u.service && u.service.toLowerCase().includes(searchTerm.toLowerCase())) ||
        userOrgs.some(o => o.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesOrg = selectedOrgs.length === 0 || selectedOrgs.some(so => userOrgs.includes(so));
      return matchesSearch && matchesRole && matchesOrg;
    });
  }, [users, searchTerm, roleFilter, selectedOrgs]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const matchesSearch = 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || r.name === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [roles, searchTerm, roleFilter]);

  // Organization Multi-Select Filter Handlers
  const toggleOrgSelection = (org: string) => {
    setSelectedOrgs(prev => 
      prev.includes(org) ? prev.filter(o => o !== org) : [...prev, org]
    );
  };

  const selectAllOrgs = () => {
    setSelectedOrgs([...availableOrganizations]);
  };

  const clearAllOrgs = () => {
    setSelectedOrgs([]);
  };

  // Quick Org Assignment for specific user
  const handleToggleUserOrg = (userId: number, org: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    const currentOrgs = targetUser.organizations && targetUser.organizations.length > 0 
      ? targetUser.organizations 
      : [targetUser.organization];
    const newOrgs = currentOrgs.includes(org)
      ? currentOrgs.filter(o => o !== org)
      : [...currentOrgs, org];
    
    // Ensure at least 1 organization remains
    if (newOrgs.length === 0) newOrgs.push(org);
    updateUserOrganizations(userId, newOrgs);
  };

  // Add User State with Multi-Select Org
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<RoleType>('PROVIDER');
  const [newUserCountry, setNewUserCountry] = useState('United States');
  const [newUserService, setNewUserService] = useState('THERAPY');
  const [newUserOrgs, setNewUserOrgs] = useState<string[]>(['MantraCare']);
  const [newUserReferredBy, setNewUserReferredBy] = useState('Portal (Direct)');
  const [newUserOnboardedBy, setNewUserOnboardedBy] = useState('Sarah Jenkins');
  const [newUserOpsResponsible, setNewUserOpsResponsible] = useState('Sarah Jenkins');
  const [newUserCredStartDate, setNewUserCredStartDate] = useState('Oct 29, 2026');
  const [newUserEnrollStartDate, setNewUserEnrollStartDate] = useState('Pending');

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      phone: newUserPhone.trim() || '+1 555 000-0000',
      role: newUserRole,
      country: newUserCountry,
      countryFlag: newUserCountry === 'Canada' ? '🇨🇦' : newUserCountry === 'United Kingdom' ? '🇬🇧' : '🇺🇸',
      service: newUserService,
      organization: newUserOrgs[0] || 'MantraCare',
      organizations: newUserOrgs.length > 0 ? newUserOrgs : ['MantraCare'],
      referredBy: newUserReferredBy,
      onboardedBy: newUserOnboardedBy,
      opsResponsible: newUserOpsResponsible,
      credentialingStartDate: newUserCredStartDate,
      enrollmentStartDate: newUserEnrollStartDate,
      signupDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });

    setIsAddUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserOrgs(['MantraCare']);
  };

  // Role Modal State (Create & Edit)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [modulePermissions, setModulePermissions] = useState<Record<string, { permission: PermissionLevel; level: 'ALL' | 'ASSIGNED_ONLY' }>>(() => {
    const initial: Record<string, { permission: PermissionLevel; level: 'ALL' | 'ASSIGNED_ONLY' }> = {};
    complianceModules.forEach(mod => {
      initial[mod] = { permission: 'none', level: 'ALL' };
    });
    return initial;
  });

  const handleOpenCreateModal = () => {
    setEditingRoleId(null);
    setRoleName('');
    setRoleDescription('');
    const resetPerms: Record<string, { permission: PermissionLevel; level: 'ALL' | 'ASSIGNED_ONLY' }> = {};
    complianceModules.forEach(mod => {
      resetPerms[mod] = { permission: 'none', level: 'ALL' };
    });
    setModulePermissions(resetPerms);
    setIsRoleModalOpen(true);
  };

  const handleOpenEditModal = (role: RoleDefinition) => {
    setEditingRoleId(role.id);
    setRoleName(role.name);
    setRoleDescription(role.description);

    const loadedPerms: Record<string, { permission: PermissionLevel; level: 'ALL' | 'ASSIGNED_ONLY' }> = {};
    complianceModules.forEach(mod => {
      const existing = role.permissions.find(p => p.module === mod);
      let perm: PermissionLevel = 'none';
      if (existing) {
        if (existing.edit && existing.approve) perm = 'full';
        else if (existing.edit) perm = 'view_edit';
        else if (existing.view) perm = 'view';
      } else if (role.name === 'SUPER_ADMIN' || role.name === 'ADMIN') {
        perm = 'full';
      } else {
        perm = 'view';
      }
      loadedPerms[mod] = {
        permission: perm,
        level: role.dataScope || 'ALL'
      };
    });
    setModulePermissions(loadedPerms);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    const convertedPermissions = Object.entries(modulePermissions).map(([mod, state]) => ({
      module: mod,
      view: state.permission !== 'none',
      edit: state.permission === 'view_edit' || state.permission === 'full',
      approve: state.permission === 'full',
      assign: state.permission === 'full'
    }));

    const firstScope = Object.values(modulePermissions)[0]?.level || 'ALL';

    if (editingRoleId) {
      const existing = roles.find(r => r.id === editingRoleId);
      updateRole({
        id: editingRoleId,
        name: roleName.trim(),
        description: roleDescription.trim(),
        isSystem: existing ? existing.isSystem : false,
        userCount: existing ? existing.userCount : 0,
        dataScope: firstScope,
        permissions: convertedPermissions
      });
    } else {
      createRole({
        name: roleName.trim(),
        description: roleDescription.trim(),
        dataScope: firstScope,
        permissions: convertedPermissions
      });
    }

    setIsRoleModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Matching User's Screenshot */}
      <div>
        <h1 className="text-2xl font-bold text-[#002B49] tracking-tight">Users Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage system users, assigned organizations, roles, and profiles.
        </p>
      </div>

      {/* Control Bar Matching Screenshot */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Tab Toggles + Search Bar + Org Multi-Select Filter + Role Filter */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Segmented View Toggles: Users | Roles */}
          <div className="bg-slate-100 p-1 rounded-full flex items-center gap-1 border border-slate-200/60 shrink-0">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'roles'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Roles
            </button>
          </div>

          <div className="hidden sm:block h-6 w-px bg-slate-200"></div>

          {/* Search Box matching screenshot */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 flex-1 max-w-sm focus-within:border-blue-500 focus-within:bg-white transition-all">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email or org..."
              className="text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent w-full"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Organization Multi-Select Filter Dropdown */}
          <div className="relative" ref={orgFilterRef}>
            <button
              type="button"
              onClick={() => setIsOrgFilterOpen(!isOrgFilterOpen)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                selectedOrgs.length > 0
                  ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
              title="Multi-select organization filter"
            >
              <Building2 size={13} className={selectedOrgs.length > 0 ? 'text-blue-600' : 'text-slate-400'} />
              <span>
                {selectedOrgs.length === 0
                  ? 'All Organizations'
                  : selectedOrgs.length === 1
                  ? selectedOrgs[0]
                  : `Organizations (${selectedOrgs.length})`}
              </span>
              <ChevronDown size={12} className={`transition-transform duration-150 ${isOrgFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Multi-Select Dropdown Menu */}
            {isOrgFilterOpen && (
              <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl border border-slate-200 shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Filter Organizations</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllOrgs}
                      className="text-[10px] text-blue-600 hover:underline font-semibold"
                    >
                      All
                    </button>
                    <span className="text-slate-200">|</span>
                    <button
                      type="button"
                      onClick={clearAllOrgs}
                      className="text-[10px] text-slate-500 hover:underline font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="px-2 pt-2 pb-1">
                  <input
                    type="text"
                    value={orgFilterSearch}
                    onChange={(e) => setOrgFilterSearch(e.target.value)}
                    placeholder="Search organizations..."
                    className="w-full px-2.5 py-1 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto px-1 py-1 space-y-0.5">
                  {availableOrganizations
                    .filter(org => org.toLowerCase().includes(orgFilterSearch.toLowerCase()))
                    .map((org) => {
                      const isChecked = selectedOrgs.includes(org);
                      return (
                        <label
                          key={org}
                          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors text-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleOrgSelection(org)}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                          />
                          <span className="font-medium flex-1 truncate">{org}</span>
                          {isChecked && <Check size={12} className="text-blue-600 shrink-0" />}
                        </label>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none appearance-none pr-7 hover:border-slate-300"
            >
              <option value="ALL">All Roles</option>
              <option value="PROVIDER">Provider</option>
              <option value="ADMIN">Admin</option>
              <option value="CREDENTIALING_SPECIALIST">Credentialing Specialist</option>
              <option value="ORG ADMIN">Org Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            <ChevronDown size={12} className="text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Right Side: Total Count and Add User / Create Role button */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          {activeTab === 'users' ? (
            <>
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                {filteredUsers.length} users
              </span>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Add User</span>
              </button>
            </>
          ) : (
            <>
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                {filteredRoles.length} roles
              </span>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Create Role</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Selected Organization Filter Chips (if any) */}
      {selectedOrgs.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Filtered Orgs:</span>
          {selectedOrgs.map((org) => (
            <span
              key={org}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[11px]"
            >
              <Building2 size={11} />
              <span>{org}</span>
              <button
                type="button"
                onClick={() => toggleOrgSelection(org)}
                className="hover:text-blue-900 cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAllOrgs}
            className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold underline ml-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: USERS TABLE (MATCHING SCREENSHOT + REQUESTED COLS) */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0 min-w-[1900px]">
              <thead>
                <tr className="bg-[#002B49] text-white text-[11px] font-bold uppercase tracking-wider">
                  {/* Col 1: Settings Gear Icon (width 44px sticky left-0) */}
                  <th className="py-3.5 px-0 w-[44px] min-w-[44px] max-w-[44px] text-center border-r border-b border-[#1a4a6e] box-border sticky left-0 bg-[#002B49] z-30">
                    <button
                      type="button"
                      onClick={() => setIsColumnSettingsOpen(true)}
                      className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer mx-auto text-slate-200 hover:text-white"
                      title="Column Settings (Reorder & Toggle Columns)"
                    >
                      <Settings size={15} />
                    </button>
                  </th>

                  {/* Col 2: USER (Avatar + Name + ID) (sticky left-44px) */}
                  <th className="py-3.5 px-5 border-r border-b border-[#1a4a6e] whitespace-nowrap min-w-[220px] sticky left-[44px] bg-[#002B49] z-30 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.25)]">
                    USER
                  </th>

                  {/* Dynamic Visible Columns */}
                  {visibleColumns.map((col, idx) => {
                    const isLast = idx === visibleColumns.length - 1;
                    return (
                      <th
                        key={col.id}
                        className={`py-3.5 px-4 border-b border-[#1a4a6e] whitespace-nowrap ${
                          !isLast ? 'border-r border-[#1a4a6e]' : ''
                        }`}
                        style={{ minWidth: col.minWidth }}
                      >
                        {col.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="text-xs">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumns.length + 2} className="text-center py-16 text-slate-400 text-sm border-b border-slate-100">
                      No users found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => {
                    const isNearBottom = idx >= filteredUsers.length - 2 && filteredUsers.length > 2;
                    const userOrgs = user.organizations && user.organizations.length > 0 
                      ? user.organizations 
                      : [user.organization];

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Col 1: Action Hamburger (≡) with Edit Option */}
                        <td className="py-3 px-0 w-[44px] min-w-[44px] max-w-[44px] text-center border-r border-b border-slate-100 box-border sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-20 relative">
                          <div className="relative inline-block text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuUserId(openMenuUserId === user.id ? null : user.id);
                              }}
                              className={`w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer mx-auto ${
                                openMenuUserId === user.id
                                  ? 'bg-blue-100 text-blue-700 font-bold'
                                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                              }`}
                              title="User Actions (Edit Role & Details)"
                              aria-label="User Actions"
                            >
                              <span className="text-base select-none font-bold leading-none">≡</span>
                            </button>

                            {openMenuUserId === user.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className={`absolute left-full ml-1 w-52 rounded-xl bg-white border border-slate-200 shadow-2xl py-1.5 z-50 text-left font-medium text-xs tracking-wide animate-in fade-in zoom-in-95 duration-100 ${
                                  isNearBottom ? 'bottom-0' : 'top-0'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditUser(user)}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left cursor-pointer font-semibold"
                                >
                                  <Edit3 size={14} className="text-blue-600" />
                                  <span>Edit Role & Details</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingUserOrgsId(user.id);
                                    setOpenMenuUserId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left border-t border-slate-100 cursor-pointer font-semibold"
                                >
                                  <Building2 size={14} className="text-indigo-600" />
                                  <span>Manage Organizations</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Col 2: USER (Avatar Circle + Name + ID: #1038) */}
                        <td className="py-3 px-5 border-r border-b border-slate-100 whitespace-nowrap sticky left-[44px] bg-white group-hover:bg-slate-50 transition-colors z-20 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.06)]">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                              <UserIcon size={14} />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {user.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Dynamic Visible Columns */}
                        {visibleColumns.map((col, cIdx) => {
                          const isLast = cIdx === visibleColumns.length - 1;
                          const borderClass = isLast ? 'border-b border-slate-100' : 'border-r border-b border-slate-100';

                          switch (col.id) {
                            case 'email':
                              return (
                                <td key={col.id} className={`py-3 px-4 text-slate-600 font-medium whitespace-nowrap ${borderClass}`}>
                                  {user.email}
                                </td>
                              );
                            case 'phone':
                              return (
                                <td key={col.id} className={`py-3 px-4 text-slate-700 whitespace-nowrap font-medium ${borderClass}`}>
                                  {user.phone || '—'}
                                </td>
                              );
                            case 'organization':
                              return (
                                <td key={col.id} className={`py-3 px-4 whitespace-nowrap ${borderClass}`}>
                                  <div className="flex items-center gap-1.5 flex-wrap relative">
                                    {userOrgs.map((org, oIdx) => (
                                      <span
                                        key={oIdx}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                                      >
                                        {org}
                                      </span>
                                    ))}
                                    
                                    {/* Quick Multi-Select Org Assignment Button */}
                                    <button
                                      type="button"
                                      onClick={() => setEditingUserOrgsId(editingUserOrgsId === user.id ? null : user.id)}
                                      className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors"
                                      title="Edit multi-select organizations"
                                    >
                                      +
                                    </button>

                                    {/* Quick Inline Multi-Select Popover */}
                                    {editingUserOrgsId === user.id && (
                                      <div
                                        ref={userOrgPopoverRef}
                                        className="absolute left-0 top-full mt-1 w-56 bg-white rounded-xl border border-slate-200 shadow-2xl p-2 z-50 text-xs text-left"
                                      >
                                        <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider mb-1.5 px-1 border-b border-slate-100 pb-1">
                                          Assign Organizations
                                        </div>
                                        <div className="space-y-1 max-h-48 overflow-y-auto">
                                          {availableOrganizations.map((org) => {
                                            const hasOrg = userOrgs.includes(org);
                                            return (
                                              <button
                                                key={org}
                                                type="button"
                                                onClick={() => handleToggleUserOrg(user.id, org)}
                                                className={`w-full flex items-center justify-between px-2 py-1 rounded text-left transition-colors cursor-pointer ${
                                                  hasOrg ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                                                }`}
                                              >
                                                <span>{org}</span>
                                                {hasOrg && <Check size={12} className="text-blue-600" />}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              );
                            case 'country':
                              return (
                                <td key={col.id} className={`py-3 px-4 text-slate-700 whitespace-nowrap ${borderClass}`}>
                                  <span className="mr-1.5">{user.countryFlag}</span>
                                  {user.country}
                                </td>
                              );
                            case 'service':
                              return (
                                <td key={col.id} className={`py-3 px-4 text-blue-700 font-semibold uppercase tracking-tight whitespace-nowrap ${borderClass}`}>
                                  {user.service || '—'}
                                </td>
                              );
                            case 'referredBy':
                              return (
                                <td key={col.id} className={`py-3 px-4 whitespace-nowrap ${borderClass}`}>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200">
                                    {user.referredBy || 'Portal (Direct)'}
                                  </span>
                                </td>
                              );
                            case 'onboardedBy':
                              return (
                                <td key={col.id} className={`py-3 px-4 whitespace-nowrap ${borderClass}`}>
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200">
                                    <UserCheck size={12} className="text-slate-400 shrink-0" />
                                    <span>{user.onboardedBy || 'Sarah Jenkins'}</span>
                                  </span>
                                </td>
                              );
                            case 'opsResponsible':
                              return (
                                <td key={col.id} className={`py-3 px-4 whitespace-nowrap ${borderClass}`}>
                                  <div className="relative inline-block text-left">
                                    <select
                                      value={user.opsResponsible || availableSpecialists[0]}
                                      onChange={(e) => assignUserSpecialist(user.id, e.target.value)}
                                      className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer appearance-none pr-6 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                      {availableSpecialists.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                      ))}
                                    </select>
                                    <ChevronDown size={12} className="text-slate-400 absolute right-2 top-2 pointer-events-none" />
                                  </div>
                                </td>
                              );
                            case 'credentialingStartDate':
                              return (
                                <td key={col.id} className={`py-3 px-4 text-slate-600 font-medium whitespace-nowrap ${borderClass}`}>
                                  {user.credentialingStartDate || 'Oct 28, 2026'}
                                </td>
                              );
                            case 'enrollmentStartDate':
                              return (
                                <td key={col.id} className={`py-3 px-4 whitespace-nowrap ${borderClass}`}>
                                  {user.enrollmentStartDate && user.enrollmentStartDate !== 'Pending' && user.enrollmentStartDate !== '—' ? (
                                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                                      {user.enrollmentStartDate}
                                    </span>
                                  ) : (
                                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] font-semibold">
                                      {user.enrollmentStartDate || 'Pending'}
                                    </span>
                                  )}
                                </td>
                              );
                            case 'signupDate':
                              return (
                                <td key={col.id} className={`py-3 px-4 text-slate-600 whitespace-nowrap font-medium ${borderClass}`}>
                                  {user.signupDate}
                                </td>
                              );
                            case 'role':
                              return (
                                <td key={col.id} className={`py-3 px-4 whitespace-nowrap ${borderClass}`}>
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-tight">
                                    <UserIcon size={11} className="text-blue-500" />
                                    <span>{user.role}</span>
                                  </span>
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
          </div>

          {/* Pagination Bar */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 uppercase text-[10px] tracking-wider">Rows Per Page</span>
              <select className="border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none text-xs">
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <div>
              Showing 1-{filteredUsers.length} of {filteredUsers.length}
            </div>
            <div className="flex items-center gap-4">
              <span>Page 1 / 1</span>
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
      )}

      {/* ======================================================== */}
      {/* TAB 2: ROLES TABLE (PERMISSIONS & ROLES VIEW) */}
      {/* ======================================================== */}
      {activeTab === 'roles' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#002B49] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-3 w-10 text-center border-r border-[#1a4a6e]">
                    <Settings size={14} className="text-slate-300 mx-auto" />
                  </th>
                  <th className="py-3.5 px-6 border-r border-[#1a4a6e]">Role Name</th>
                  <th className="py-3.5 px-6 border-r border-[#1a4a6e]">Description</th>
                  <th className="py-3.5 px-6 border-r border-[#1a4a6e]">Created At</th>
                  <th className="py-3.5 px-6">Users Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 text-center text-slate-400 border-r border-slate-100">
                      <Menu size={14} className="mx-auto" />
                    </td>
                    <td className="py-3.5 px-6 border-r border-slate-100">
                      <button
                        onClick={() => handleOpenEditModal(role)}
                        className="font-semibold text-blue-600 hover:underline cursor-pointer text-left"
                      >
                        {role.name}
                      </button>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 max-w-[340px] border-r border-slate-100">
                      {role.description || "—"}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 whitespace-nowrap border-r border-slate-100">
                      Sep 21, 2026
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <UsersIcon size={14} className="text-slate-400" />
                        <span className="font-bold text-slate-800">{role.userCount}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* COLUMN SETTINGS MODAL DIALOG */}
      {/* ======================================================== */}
      {isColumnSettingsOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsColumnSettingsOpen(false)}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all z-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900">User Table Columns</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Toggle visibility or drag to reorder columns.
                </p>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
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
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      draggedColumnIdx === idx 
                        ? 'border-blue-400 bg-blue-50/50 shadow-md scale-[1.01]' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="cursor-grab text-slate-400 hover:text-slate-600">
                        <GripVertical size={16} />
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleColumnVisibility(col.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                          col.visible ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {col.visible && <Check size={11} strokeWidth={3} />}
                      </button>
                      <span className="text-xs font-medium text-slate-800">{col.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={resetColumns}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={() => setIsColumnSettingsOpen(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Apply Columns
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT USER MODAL (EDIT ROLES, ORGS & USER DETAILS) */}
      {/* ======================================================== */}
      {isEditUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsEditUserModalOpen(false)}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 transform transition-all z-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>Edit User — {editName}</span>
                      <span className="text-[11px] font-normal text-slate-400 font-mono">ID: #{editingUser.id}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Update role assignment, multi-organization membership, and details.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleSaveEditUser} className="space-y-4 text-xs">
                {/* Full Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* Phone, Role & Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      System Role <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as any)}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 bg-white cursor-pointer appearance-none pr-8 font-semibold text-blue-700"
                      >
                        <option value="PROVIDER">Provider</option>
                        <option value="ADMIN">Admin</option>
                        <option value="CREDENTIALING_SPECIALIST">Credentialing Specialist</option>
                        <option value="ORG ADMIN">Org Admin</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                      <ChevronDown size={14} className="text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Account Status
                    </label>
                    <div className="relative">
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as any)}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 bg-white cursor-pointer appearance-none pr-8 font-semibold text-slate-800"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                      <ChevronDown size={14} className="text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Multi-Select Organization Selection */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Assigned Organizations (Multi-Select) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-blue-600 font-semibold">
                      {editOrgs.length} selected
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {availableOrganizations.map((org) => {
                      const isSelected = editOrgs.includes(org);
                      return (
                        <button
                          key={org}
                          type="button"
                          onClick={() => {
                            setEditOrgs(prev => {
                              const updated = prev.includes(org) ? prev.filter(o => o !== org) : [...prev, org];
                              return updated.length === 0 ? [org] : updated;
                            });
                          }}
                          className={`p-2 rounded-lg border text-left text-xs flex items-center justify-between transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-blue-600 border-blue-600 text-white font-semibold shadow-2xs' 
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span className="truncate">{org}</span>
                          {isSelected && <Check size={13} className="shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Country & Service */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Country
                    </label>
                    <select
                      value={editCountry}
                      onChange={(e) => setNewUserCountry(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 bg-white cursor-pointer"
                    >
                      <option value="United States">🇺🇸 United States</option>
                      <option value="Canada">🇨🇦 Canada</option>
                      <option value="United Kingdom">🇬🇧 United Kingdom</option>
                      <option value="Philippines">🇵🇭 Philippines</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Service
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. THERAPY, OCCUPATIONAL THERAPIST"
                      value={editService}
                      onChange={(e) => setEditService(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 uppercase font-semibold text-blue-700"
                    />
                  </div>
                </div>

                {/* Referred by & Onboarded by */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Referred by
                    </label>
                    <input
                      type="text"
                      value={editReferredBy}
                      onChange={(e) => setEditReferredBy(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Onboarded by
                    </label>
                    <input
                      type="text"
                      value={editOnboardedBy}
                      onChange={(e) => setEditOnboardedBy(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* Ops Responsible & Start Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Ops Responsible
                    </label>
                    <select
                      value={editOpsResponsible}
                      onChange={(e) => setEditOpsResponsible(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 bg-white cursor-pointer font-semibold text-slate-800"
                    >
                      {availableSpecialists.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Credentialing Start Date
                    </label>
                    <input
                      type="text"
                      value={editCredStartDate}
                      onChange={(e) => setEditCredStartDate(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Enrollment Start Date
                    </label>
                    <input
                      type="text"
                      value={editEnrollStartDate}
                      onChange={(e) => setEditEnrollStartDate(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditUserModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD USER MODAL (WITH MULTI-SELECT ORGANIZATION) */}
      {/* ======================================================== */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsAddUserModalOpen(false)}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 transform transition-all z-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <UserIcon size={18} className="text-blue-600" />
                    <span>Add New User</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Create system account and configure multi-organization membership.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs">
                {/* Full Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nancy Brooks"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. nancy@example.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Phone & Role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +1 7174905619"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      System Role <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as any)}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 bg-white cursor-pointer appearance-none pr-8 font-semibold"
                      >
                        <option value="PROVIDER">Provider</option>
                        <option value="ADMIN">Admin</option>
                        <option value="CREDENTIALING_SPECIALIST">Credentialing Specialist</option>
                        <option value="ORG ADMIN">Org Admin</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                      <ChevronDown size={14} className="text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Multi-Select Organization Selection */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Assigned Organizations (Multi-Select) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-blue-600 font-semibold">
                      {newUserOrgs.length} selected
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {availableOrganizations.map((org) => {
                      const isSelected = newUserOrgs.includes(org);
                      return (
                        <button
                          key={org}
                          type="button"
                          onClick={() => {
                            setNewUserOrgs(prev => 
                              prev.includes(org) ? prev.filter(o => o !== org) : [...prev, org]
                            );
                          }}
                          className={`p-2 rounded-lg border text-left text-xs flex items-center justify-between transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-blue-600 border-blue-600 text-white font-semibold shadow-2xs' 
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span className="truncate">{org}</span>
                          {isSelected && <Check size={13} className="shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Country & Service */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Country
                    </label>
                    <select
                      value={newUserCountry}
                      onChange={(e) => setNewUserCountry(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 bg-white cursor-pointer"
                    >
                      <option value="United States">🇺🇸 United States</option>
                      <option value="Canada">🇨🇦 Canada</option>
                      <option value="United Kingdom">🇬🇧 United Kingdom</option>
                      <option value="Philippines">🇵🇭 Philippines</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Service
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. THERAPY, OCCUPATIONAL THERAPIST"
                      value={newUserService}
                      onChange={(e) => setNewUserService(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 uppercase font-semibold text-blue-700"
                    />
                  </div>
                </div>

                {/* Referred by & Onboarded by */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Referred by
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Portal (Direct), Dr. Robert Vance"
                      value={newUserReferredBy}
                      onChange={(e) => setNewUserReferredBy(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Onboarded by
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      value={newUserOnboardedBy}
                      onChange={(e) => setNewUserOnboardedBy(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Ops Responsible & Start Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Ops Responsible
                    </label>
                    <select
                      value={newUserOpsResponsible}
                      onChange={(e) => setNewUserOpsResponsible(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 bg-white cursor-pointer font-semibold"
                    >
                      {availableSpecialists.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Credentialing Start Date
                    </label>
                    <input
                      type="text"
                      value={newUserCredStartDate}
                      onChange={(e) => setNewUserCredStartDate(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Enrollment Start Date
                    </label>
                    <input
                      type="text"
                      value={newUserEnrollStartDate}
                      onChange={(e) => setNewUserEnrollStartDate(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Create User Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE / EDIT ROLE MODAL */}
      {/* ======================================================== */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsRoleModalOpen(false)}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all overflow-hidden border border-slate-200">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editingRoleId ? 'Edit Role & Permissions' : 'Create Custom Role'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Define module permission levels and operational scope.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRoleModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveRole} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Role Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. COMPLIANCE_OFFICER"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold uppercase text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      placeholder="Role purpose and responsibility..."
                      value={roleDescription}
                      onChange={(e) => setRoleDescription(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Module Access & Permissions Matrix
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#002B49] text-white text-[10px] font-bold uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-4">Compliance Module</th>
                          <th className="py-2.5 px-4">Permission Level</th>
                          <th className="py-2.5 px-4">Data Scope</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {complianceModules.map((mod) => (
                          <tr key={mod} className="hover:bg-slate-50/80">
                            <td className="py-3 px-4 font-semibold text-slate-800">{mod}</td>
                            <td className="py-3 px-4">
                              <select
                                value={modulePermissions[mod]?.permission || 'none'}
                                onChange={(e) => {
                                  const val = e.target.value as PermissionLevel;
                                  setModulePermissions(prev => ({
                                    ...prev,
                                    [mod]: { ...prev[mod], permission: val }
                                  }));
                                }}
                                className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs bg-white font-medium text-slate-700 cursor-pointer"
                              >
                                <option value="none">No Access</option>
                                <option value="view">View Only</option>
                                <option value="view_edit">View & Edit</option>
                                <option value="full">Full Control</option>
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={modulePermissions[mod]?.level || 'ALL'}
                                onChange={(e) => {
                                  const val = e.target.value as 'ALL' | 'ASSIGNED_ONLY';
                                  setModulePermissions(prev => ({
                                    ...prev,
                                    [mod]: { ...prev[mod], level: val }
                                  }));
                                }}
                                className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs bg-white font-medium text-slate-700 cursor-pointer"
                              >
                                <option value="ALL">All Records</option>
                                <option value="ASSIGNED_ONLY">Assigned Only</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRoleModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Save Role
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
