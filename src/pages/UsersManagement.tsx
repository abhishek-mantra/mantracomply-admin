import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Settings, 
  Menu, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Check,
  Plus,
  Shield,
  X,
  Edit3,
  Trash2,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RoleType, PermissionSet, RoleDefinition } from '../data/mockData';

const defaultModules = [
  "Credential Applications",
  "Document Verification",
  "Enrollment Applications",
  "User Management",
  "Plans & Pricing",
  "Credits Management",
  "Subscriptions & Orders"
];

export const UsersManagement: React.FC = () => {
  const { 
    users, 
    updateUserRole, 
    roles, 
    createRole, 
    updateRole,
    deleteRole,
    isSuperAdmin 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [openDropdownUserId, setOpenDropdownUserId] = useState<number | null>(null);

  // Auto-switch to 'users' if current persona is not super admin
  useEffect(() => {
    if (!isSuperAdmin && activeTab === 'roles') {
      setActiveTab('users');
    }
  }, [isSuperAdmin, activeTab]);

  // Edit Role Modal State
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [editRoleDescription, setEditRoleDescription] = useState('');
  const [editDataScope, setEditDataScope] = useState<'ALL' | 'ASSIGNED_ONLY'>('ALL');
  const [editPermissions, setEditPermissions] = useState<PermissionSet[]>([]);

  // New Role Modal State
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newDataScope, setNewDataScope] = useState<'ALL' | 'ASSIGNED_ONLY'>('ALL');
  const [newPermissions, setNewPermissions] = useState<PermissionSet[]>(
    defaultModules.map(module => ({
      module,
      view: true,
      edit: false,
      approve: false,
      assign: false
    }))
  );

  const openEditModal = (role: RoleDefinition) => {
    setEditingRole(role);
    setEditRoleName(role.name);
    setEditRoleDescription(role.description);
    setEditDataScope(role.dataScope);
    
    // Ensure all modules are represented in permissions list
    const perms: PermissionSet[] = defaultModules.map(modName => {
      const found = role.permissions.find(p => p.module === modName);
      if (found) {
        return { ...found };
      }
      return { module: modName, view: false, edit: false, approve: false, assign: false };
    });
    setEditPermissions(perms);
  };

  const toggleEditPermission = (moduleName: string, action: 'view' | 'edit' | 'approve' | 'assign') => {
    setEditPermissions(prev => prev.map(p => {
      if (p.module === moduleName) {
        return { ...p, [action]: !p[action] };
      }
      return p;
    }));
  };

  const handleGrantAll = () => {
    setEditPermissions(prev => prev.map(p => ({
      ...p,
      view: true,
      edit: true,
      approve: true,
      assign: true
    })));
  };

  const handleRevokeAll = () => {
    setEditPermissions(prev => prev.map(p => ({
      ...p,
      view: false,
      edit: false,
      approve: false,
      assign: false
    })));
  };

  const handleSaveEditedRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole || !editRoleName.trim()) return;

    updateRole({
      ...editingRole,
      name: editRoleName.trim().toUpperCase().replace(/\s+/g, '_'),
      description: editRoleDescription.trim(),
      dataScope: editDataScope,
      permissions: editPermissions
    });

    setEditingRole(null);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const toggleSelectUser = (id: number) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(uId => uId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const toggleNewPermission = (moduleName: string, action: 'view' | 'edit' | 'approve' | 'assign') => {
    setNewPermissions(prev => prev.map(p => {
      if (p.module === moduleName) {
        return { ...p, [action]: !p[action] };
      }
      return p;
    }));
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    createRole({
      name: newRoleName.trim().toUpperCase().replace(/\s+/g, '_'),
      description: newRoleDescription.trim() || 'Custom platform role with defined permissions.',
      dataScope: newDataScope,
      permissions: newPermissions
    });

    setNewRoleName('');
    setNewRoleDescription('');
    setIsNewRoleModalOpen(false);
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchSearch = searchTerm === '' ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = roleFilter === 'ALL' || user.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchTerm, roleFilter]);

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ADMIN':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'CREDENTIALING_SPECIALIST':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ORG ADMIN':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          User Management
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Orchestrate your team's access and operational permissions.
        </p>
      </div>

      {/* Unified Controls Pill Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Sub-tab Pill Switcher - ONLY SUPERADMIN HAS ACCESS TO ROLES TAB */}
          {isSuperAdmin ? (
            <div className="bg-slate-100/90 p-1 rounded-full inline-flex items-center gap-1 border border-slate-200/60">
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
                Roles & Permissions
              </button>
            </div>
          ) : (
            <div className="bg-slate-100/90 px-4 py-1.5 rounded-full border border-slate-200/60 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Lock size={12} className="text-slate-400" />
              <span>Users Directory</span>
            </div>
          )}

          <div className="hidden sm:block h-6 w-px bg-slate-200"></div>

          {/* Search & All Users Pill Filter */}
          <div className="flex items-center gap-2 flex-1 min-w-[260px]">
            <Search size={16} className="text-slate-400 shrink-0 ml-1" />
            
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1 rounded-full border border-blue-200 bg-blue-50/70 text-xs font-semibold text-blue-600 cursor-pointer focus:outline-none appearance-none pr-7"
              >
                <option value="ALL">All Users</option>
                {roles.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
              <ChevronDown size={12} className="text-blue-600 absolute right-2.5 top-2 pointer-events-none" />
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent w-full max-w-[200px]"
            />
          </div>
        </div>

        {/* Create Role Button (Only for Super Admin on Roles tab) */}
        {activeTab === 'roles' && isSuperAdmin && (
          <button
            onClick={() => setIsNewRoleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
          >
            <Plus size={14} />
            Create Role
          </button>
        )}
      </div>

      {activeTab === 'users' ? (
        /* USERS TABLE */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0b2545] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-400 text-blue-600 focus:ring-0 cursor-pointer bg-white"
                    />
                  </th>
                  <th className="py-3.5 px-3 w-10 text-center">
                    <Settings size={14} className="text-slate-300 mx-auto" />
                  </th>
                  <th className="py-3.5 px-5">Name</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Created At</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-slate-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(item.id)}
                          onChange={() => toggleSelectUser(item.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-400">
                        <Menu size={14} className="mx-auto cursor-grab" />
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-blue-600 hover:underline cursor-pointer">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-4">
                        {/* Interactive Role Assignment for Super Admin */}
                        {isSuperAdmin ? (
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => setOpenDropdownUserId(openDropdownUserId === item.id ? null : item.id)}
                              className={`inline-flex items-center justify-between gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase border transition-all cursor-pointer ${getRoleBadgeStyle(
                                item.role
                              )} hover:shadow-xs`}
                              title="Click to assign role"
                            >
                              <span>{item.role}</span>
                              <ChevronDown size={11} className="opacity-60" />
                            </button>

                            {openDropdownUserId === item.id && (
                              <div className="absolute left-0 mt-1 w-52 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-50 text-left font-semibold text-xs animate-in fade-in zoom-in-95 duration-150">
                                <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider">
                                  Assign User Role
                                </div>
                                {roles.map((r) => {
                                  const isSelected = r.name === item.role;
                                  return (
                                    <button
                                      key={r.id}
                                      onClick={() => {
                                        updateUserRole(item.id, r.name as RoleType);
                                        setOpenDropdownUserId(null);
                                      }}
                                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                                        isSelected ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700'
                                      }`}
                                    >
                                      <span>{r.name}</span>
                                      {isSelected && <Check size={13} className="text-blue-600" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase border ${getRoleBadgeStyle(item.role)}`}>
                            {item.role}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate font-medium">
                        {item.email}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {item.signupDate}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="p-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-white text-xs">
            <div className="flex items-center gap-6 text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <span className="uppercase text-[11px] font-semibold text-slate-400">Rows per page</span>
                <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-2 py-1 bg-white font-semibold text-slate-700">
                  <span>20</span>
                  <ChevronDown size={13} className="text-slate-400" />
                </div>
              </div>
              <div>
                Showing <span className="font-semibold text-slate-700">1-{filteredUsers.length}</span> of {users.length}
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
      ) : (
        /* ROLES TAB - ONLY SUPERADMIN HAS PERMISSION */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-purple-950 font-medium">
              <Shield size={16} className="text-purple-600 shrink-0" />
              <span>
                <strong>Super Admin Permissions Control:</strong> You have full authority to define, rename, and assign module-level rights (View, Edit, Approve, Assign) to any role.
              </span>
            </div>
            <span className="font-bold text-[10px] tracking-wide uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-300">
              Super Admin Only
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0b2545] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Role Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-4 text-center">Assigned Users</th>
                  <th className="py-3.5 px-4 text-center">Data Boundary Scope</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {roles.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{r.name}</span>
                        <button
                          onClick={() => openEditModal(r)}
                          className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Edit role name & permissions"
                        >
                          <Edit3 size={13} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {r.isSystem ? (
                        <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          System
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                          Custom
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 max-w-[340px]">
                      {r.description}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {r.userCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                        r.dataScope === 'ALL'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {r.dataScope === 'ALL' ? '🌐 All Records' : '👤 Assigned Only'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button 
                        onClick={() => openEditModal(r)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <Edit3 size={13} />
                        Edit Permissions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT ROLE & PERMISSIONS MODAL SCREEN */}
      {editingRole && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Shield size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Edit Role & Module Permissions
                  </h3>
                  <p className="text-xs text-slate-500">
                    Super Admin: Name the role whatever you wish and toggle any module rights.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingRole(null)}
                className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveEditedRole} className="p-6 overflow-y-auto space-y-6">
              {/* Role Title and Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Role Title (Editable)
                  </label>
                  <input
                    type="text"
                    required
                    value={editRoleName}
                    onChange={(e) => setEditRoleName(e.target.value)}
                    placeholder="e.g. CREDENTIALING_LEAD"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-wide"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Super Admin can rename any role as required.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editRoleDescription}
                    onChange={(e) => setEditRoleDescription(e.target.value)}
                    placeholder="Role responsibilities and operational scope..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Data Visibility Boundary */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Data Boundary Scope
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditDataScope('ALL')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      editDataScope === 'ALL'
                        ? 'border-blue-500 bg-blue-50/60 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">🌐 Full / All Records Access</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Can view all requests and applications across all specialists org-wide.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditDataScope('ASSIGNED_ONLY')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      editDataScope === 'ASSIGNED_ONLY'
                        ? 'border-emerald-500 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">👤 Assigned Records Only (Strict Isolation)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Restricted to only records explicitly assigned to this representative user.
                    </div>
                  </button>
                </div>
              </div>

              {/* Granular Module Permissions Matrix */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Module Access Rights & Action Permissions
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGrantAll}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Grant All
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={handleRevokeAll}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Revoke All
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0b2545] text-white text-[10px] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-4">Module Name</th>
                        <th className="py-2.5 px-3 text-center">View</th>
                        <th className="py-2.5 px-3 text-center">Edit</th>
                        <th className="py-2.5 px-3 text-center">Approve</th>
                        <th className="py-2.5 px-3 text-center">Assign</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {editPermissions.map((perm) => (
                        <tr key={perm.module} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-semibold text-slate-800">{perm.module}</td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={perm.view}
                              onChange={() => toggleEditPermission(perm.module, 'view')}
                              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={perm.edit}
                              onChange={() => toggleEditPermission(perm.module, 'edit')}
                              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={perm.approve}
                              onChange={() => toggleEditPermission(perm.module, 'approve')}
                              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={perm.assign}
                              onChange={() => toggleEditPermission(perm.module, 'assign')}
                              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {!editingRole.isSystem && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete role ${editingRole.name}?`)) {
                          deleteRole(editingRole.id);
                          setEditingRole(null);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                      Delete Role
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingRole(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Check size={14} /> Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW ROLE MODAL */}
      {isNewRoleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-blue-600" />
                <h3 className="text-base font-bold text-slate-800">Define New System Role</h3>
              </div>
              <button
                onClick={() => setIsNewRoleModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Role Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CREDENTIALING_LEAD"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the role responsibilities..."
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Data Visibility Boundary
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewDataScope('ALL')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      newDataScope === 'ALL'
                        ? 'border-blue-500 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">🌐 Full / All Records Access</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Can view all requests and specialist workloads org-wide.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewDataScope('ASSIGNED_ONLY')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      newDataScope === 'ASSIGNED_ONLY'
                        ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">👤 Assigned Records Only</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Restricted to only records explicitly assigned to this user.
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Module Permissions Checklist
                </label>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0b2545] text-white text-[10px] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-4">Module Name</th>
                        <th className="py-2.5 px-3 text-center">View</th>
                        <th className="py-2.5 px-3 text-center">Edit</th>
                        <th className="py-2.5 px-3 text-center">Approve</th>
                        <th className="py-2.5 px-3 text-center">Assign</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {newPermissions.map((perm) => (
                        <tr key={perm.module} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-semibold text-slate-800">{perm.module}</td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={perm.view}
                              onChange={() => toggleNewPermission(perm.module, 'view')}
                              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={perm.edit}
                              onChange={() => toggleNewPermission(perm.module, 'edit')}
                              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={perm.approve}
                              onChange={() => toggleNewPermission(perm.module, 'approve')}
                              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={perm.assign}
                              onChange={() => toggleNewPermission(perm.module, 'assign')}
                              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} /> Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
