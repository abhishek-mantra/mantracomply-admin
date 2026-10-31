import React, { useState, useMemo } from 'react';
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
  Users as UsersIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RoleDefinition } from '../data/mockData';

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

export const UsersManagement: React.FC = () => {
  const { 
    users, 
    roles, 
    createRole, 
    updateRole,
    addUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Role Modal State (Create & Edit)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  
  // Module Permissions State: mapping module name -> { permission: PermissionLevel, level: 'ALL' | 'ASSIGNED_ONLY' }
  const [modulePermissions, setModulePermissions] = useState<Record<string, { permission: PermissionLevel; level: 'ALL' | 'ASSIGNED_ONLY' }>>(() => {
    const initial: Record<string, { permission: PermissionLevel; level: 'ALL' | 'ASSIGNED_ONLY' }> = {};
    complianceModules.forEach(mod => {
      initial[mod] = { permission: 'none', level: 'ALL' };
    });
    return initial;
  });

  // Open Create Role Modal
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

  // Open Edit Role Modal
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

    // Convert to mockData PermissionSet format
    const convertedPermissions = Object.entries(modulePermissions).map(([mod, state]) => ({
      module: mod,
      view: state.permission !== 'none',
      edit: state.permission === 'view_edit' || state.permission === 'full',
      approve: state.permission === 'full',
      assign: state.permission === 'full'
    }));

    // Find predominant data scope
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

  // Add User State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserRole, setNewUserRole] = useState<string>('CREDENTIALING_SPECIALIST');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [sendInvite, setSendInvite] = useState(true);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

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

  const toggleSelectAll = () => {
    if (activeTab === 'roles') {
      if (selectedItems.length === filteredRoles.length) {
        setSelectedItems([]);
      } else {
        setSelectedItems(filteredRoles.map(r => r.id));
      }
    } else {
      if (selectedItems.length === filteredUsers.length) {
        setSelectedItems([]);
      } else {
        setSelectedItems(filteredUsers.map(u => u.id.toString()));
      }
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const roleDates: Record<string, string> = {
    SUPER_ADMIN: "Sep 21, 2026",
    ADMIN: "Sep 21, 2026",
    CREDENTIALING_SPECIALIST: "Oct 28, 2026",
    ORG_ADMIN: "Aug 20, 2026",
    PROVIDER: "Aug 15, 2026",
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0b2545] tracking-tight">User Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Orchestrate your team's access, permissions, and operational credits.
        </p>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left Segmented Control Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto">
          <div className="bg-slate-100 p-1 rounded-full flex items-center gap-1 border border-slate-200/60 shrink-0">
            <button
              onClick={() => {
                setActiveTab('users');
                setSelectedItems([]);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => {
                setActiveTab('roles');
                setSelectedItems([]);
              }}
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

          {/* Search & All Roles Filter */}
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Search size={16} className="text-slate-400 shrink-0 ml-1" />
            
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1 rounded-full border border-blue-200 bg-blue-50/70 text-xs font-semibold text-blue-600 cursor-pointer focus:outline-none appearance-none pr-7"
              >
                <option value="ALL">All Roles</option>
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

        {/* Right Side Actions */}
        <div className="flex items-center gap-3 self-end md:self-auto pr-2">
          {activeTab === 'roles' ? (
            <>
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                {filteredRoles.length} roles
              </span>
              <button
                onClick={handleOpenCreateModal}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-sm transition-all cursor-pointer"
                title="Create Role"
              >
                <Plus size={16} />
              </button>
            </>
          ) : activeTab === 'users' ? (
            <>
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                {filteredUsers.length} users
              </span>
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={14} />
                Add User
              </button>
            </>
          ) : (
          null
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'roles' ? (
        /* ROLES TABLE (EXACT MATCH TO IMAGE 1) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1e293b] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredRoles.length && filteredRoles.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-400 text-blue-600 focus:ring-0 cursor-pointer bg-white"
                    />
                  </th>
                  <th className="py-3.5 px-3 w-10 text-center">
                    <Settings size={14} className="text-slate-300 mx-auto" />
                  </th>
                  <th className="py-3.5 px-6">Role Name</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-6">Created At</th>
                  <th className="py-3.5 px-6">Users Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRoles.map((role) => {
                  const isChecked = selectedItems.includes(role.id);
                  const displayDate = roleDates[role.name] || "Oct 28, 2026";

                  return (
                    <tr key={role.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectItem(role.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-400">
                        <Menu size={14} className="mx-auto cursor-grab" />
                      </td>
                      <td className="py-3.5 px-6">
                        <button
                          onClick={() => handleOpenEditModal(role)}
                          className="font-medium text-[#2563EB] hover:underline cursor-pointer text-left"
                        >
                          {role.name}
                        </button>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 max-w-[340px]">
                        {role.description || "—"}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 whitespace-nowrap">
                        {displayDate}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <UsersIcon size={14} className="text-slate-400" />
                          <span className="font-medium">{role.userCount}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar (Matching Image 1) */}
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
              Showing 1-{filteredRoles.length} of {filteredRoles.length}
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
      ) : activeTab === 'users' ? (
        /* USERS TABLE */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1e293b] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-400 text-blue-600 focus:ring-0 cursor-pointer bg-white"
                    />
                  </th>
                  <th className="py-3.5 px-3 w-10 text-center">
                    <Settings size={14} className="text-slate-300 mx-auto" />
                  </th>
                  <th className="py-3.5 px-6">Name</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Created At</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(user.id.toString())}
                        onChange={() => toggleSelectItem(user.id.toString())}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-400">
                      <Menu size={14} className="mx-auto cursor-grab" />
                    </td>
                    <td className="py-3.5 px-6 font-medium text-[#2563EB] hover:underline cursor-pointer">
                      {user.name}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 font-medium">
                      {user.email}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 whitespace-nowrap">
                      {user.signupDate}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
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
      ) : null}

      {/* CREATE / EDIT ROLE MODAL (EXACT MATCH TO IMAGE 2) */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsRoleModalOpen(false)}
            />

            {/* Modal Dialog */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all overflow-hidden border border-slate-200">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {editingRoleId ? 'Edit Role' : 'Create Role'}
                </h2>
                {/* Red Circular Close Button matching Image 2 */}
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#ef4444] hover:bg-[#dc2626] text-white flex items-center justify-center transition-colors shadow-xs"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>

              <form onSubmit={handleSaveRole} className="p-6 space-y-6">
                {/* Inputs Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Role Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      placeholder="e.g. Credentialing Lead"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 placeholder-slate-400 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={roleDescription}
                      onChange={(e) => setRoleDescription(e.target.value)}
                      placeholder="e.g. Can review and verify credentialing applications"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 placeholder-slate-400 bg-white"
                    />
                  </div>
                </div>

                {/* Module Permissions Table (Matching Image 2) */}
                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  {/* Dark Navy Table Header */}
                  <div className="grid grid-cols-12 bg-[#243447] text-white text-xs font-bold uppercase tracking-wider py-3.5 px-6">
                    <div className="col-span-5">Module</div>
                    <div className="col-span-4">Permission</div>
                    <div className="col-span-3">Level</div>
                  </div>

                  {/* Scrollable Rows */}
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 bg-white">
                    {complianceModules.map((moduleName) => {
                      const state = modulePermissions[moduleName] || { permission: 'none', level: 'ALL' };

                      return (
                        <div key={moduleName} className="grid grid-cols-12 items-center py-3 px-6 hover:bg-slate-50/60 transition-colors text-xs">
                          {/* Module Name */}
                          <div className="col-span-5 font-bold text-slate-800">
                            {moduleName}
                          </div>

                          {/* Permission Dropdown */}
                          <div className="col-span-4 pr-3">
                            <div className="relative">
                              <select
                                value={state.permission}
                                onChange={(e) => {
                                  const val = e.target.value as PermissionLevel;
                                  setModulePermissions(prev => ({
                                    ...prev,
                                    [moduleName]: { ...prev[moduleName], permission: val }
                                  }));
                                }}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
                              >
                                <option value="none">Select an option...</option>
                                <option value="view">View Only</option>
                                <option value="view_edit">View & Edit</option>
                                <option value="full">Full Access</option>
                              </select>
                              <ChevronDown size={14} className="text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                            </div>
                          </div>

                          {/* Level Dropdown */}
                          <div className="col-span-3">
                            <div className="relative">
                              <select
                                value={state.level}
                                onChange={(e) => {
                                  const val = e.target.value as 'ALL' | 'ASSIGNED_ONLY';
                                  setModulePermissions(prev => ({
                                    ...prev,
                                    [moduleName]: { ...prev[moduleName], level: val }
                                  }));
                                }}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
                              >
                                <option value="ALL">All Records</option>
                                <option value="ASSIGNED_ONLY">Assigned Only</option>
                              </select>
                              <ChevronDown size={14} className="text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRoleModalOpen(false)}
                    className="px-6 py-2 rounded-full border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-full bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Save Role
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SIMPLE ADD USER DIALOG (JUST SELECT ROLE WHILE ADDING USER) */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsAddUserModalOpen(false)}
            />

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all overflow-hidden p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Add User</h3>
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
                />
              </div>

              {/* Select Role (Latter Option - Dropdown) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Role
                </label>
                <div className="relative">
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 bg-white appearance-none pr-8 cursor-pointer text-slate-800"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sendInviteUser"
                  checked={sendInvite}
                  onChange={(e) => setSendInvite(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <label htmlFor="sendInviteUser" className="text-xs text-slate-700 select-none cursor-pointer">
                  Send invite email with setup instructions
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (newUserName.trim() && newUserEmail.trim()) {
                      addUser({
                        name: newUserName.trim(),
                        email: newUserEmail.trim(),
                        role: newUserRole,
                      });
                    }
                    setIsAddUserModalOpen(false);
                    setNewUserName('');
                    setNewUserEmail('');
                  }}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
