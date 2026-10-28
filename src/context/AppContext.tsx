import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Persona, 
  defaultPersonas, 
  RoleDefinition, 
  initialRoles, 
  UserRecord, 
  initialUsers, 
  ProviderApplication, 
  initialProviders, 
  FacilityApplication, 
  initialFacilities, 
  EnrollmentRecord, 
  initialEnrollments, 
  RoleType,
  availableSpecialists
} from '../data/mockData';
import { StatusType } from '../components/StatusBadge';

interface AppContextType {
  currentPersona: Persona;
  switchPersona: (personaId: string) => void;
  personas: Persona[];
  
  roles: RoleDefinition[];
  createRole: (role: Omit<RoleDefinition, 'id' | 'isSystem' | 'userCount'>) => void;
  updateRole: (updatedRole: RoleDefinition) => void;
  deleteRole: (roleId: string) => void;
  
  users: UserRecord[];
  updateUserRole: (userId: number, newRole: RoleType) => void;
  
  providers: ProviderApplication[];
  updateProviderStatus: (id: number, status: StatusType) => void;
  assignProviderSpecialist: (id: number, specialist: string) => void;
  
  facilities: FacilityApplication[];
  updateFacilityStatus: (id: string, status: StatusType) => void;
  assignFacilitySpecialist: (id: string, specialist: string) => void;
  
  enrollments: EnrollmentRecord[];
  updateEnrollmentStatus: (id: number, status: StatusType) => void;
  assignEnrollmentSpecialist: (id: number, specialist: string) => void;

  availableSpecialists: string[];
  
  // Quick capability helpers
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isSpecialist: boolean;
  isAssignedOnly: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [personas] = useState<Persona[]>(defaultPersonas);
  const [currentPersona, setCurrentPersona] = useState<Persona>(defaultPersonas[0]);
  const [roles, setRoles] = useState<RoleDefinition[]>(initialRoles);
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [providers, setProviders] = useState<ProviderApplication[]>(initialProviders);
  const [facilities, setFacilities] = useState<FacilityApplication[]>(initialFacilities);
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>(initialEnrollments);

  const switchPersona = (personaId: string) => {
    const found = personas.find(p => p.id === personaId);
    if (found) {
      setCurrentPersona(found);
    }
  };

  const createRole = (newRoleData: Omit<RoleDefinition, 'id' | 'isSystem' | 'userCount'>) => {
    const newRole: RoleDefinition = {
      ...newRoleData,
      id: newRoleData.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString(36),
      isSystem: false,
      userCount: 0
    };
    setRoles(prev => [...prev, newRole]);
  };

  const updateRole = (updatedRole: RoleDefinition) => {
    const existing = roles.find(r => r.id === updatedRole.id);
    const oldName = existing?.name;

    setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));

    // If role name changed, update corresponding users
    if (oldName && oldName !== updatedRole.name) {
      setUsers(prev => prev.map(u => u.role === oldName ? { ...u, role: updatedRole.name } : u));
    }
  };

  const deleteRole = (roleId: string) => {
    setRoles(prev => prev.filter(r => r.id !== roleId));
  };

  const updateUserRole = (userId: number, newRole: RoleType) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    
    // Update role user counts
    setRoles(prev => prev.map(r => {
      const count = users.filter(u => (u.id === userId ? newRole : u.role) === r.name).length;
      return { ...r, userCount: count };
    }));
  };

  const updateProviderStatus = (id: number, status: StatusType) => {
    setProviders(prev => prev.map(p => {
      if (p.id === id) {
        // If moving away from approved, we can preserve or reset specialist
        return { ...p, status: status as any };
      }
      return p;
    }));
  };

  const assignProviderSpecialist = (id: number, specialist: string) => {
    setProviders(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, assignedSpecialist: specialist };
      }
      return p;
    }));

    // Synchronize or create enrollment application
    const targetProvider = providers.find(p => p.id === id);
    if (targetProvider) {
      setEnrollments(prev => {
        const existing = prev.find(e => e.providerName === targetProvider.name);
        if (existing) {
          return prev.map(e => e.id === existing.id ? { ...e, assignedSpecialist: specialist } : e);
        } else {
          const newEnrollment: EnrollmentRecord = {
            id: Date.now() % 10000,
            providerName: targetProvider.name,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            organization: targetProvider.organization,
            service: targetProvider.service,
            insurance: "Aetna (Primary)",
            status: "PENDING",
            assignedSpecialist: specialist
          };
          return [newEnrollment, ...prev];
        }
      });
    }
  };

  const updateFacilityStatus = (id: string, status: StatusType) => {
    setFacilities(prev => prev.map(f => f.id === id ? { ...f, status: status as any } : f));
  };

  const assignFacilitySpecialist = (id: string, specialist: string) => {
    setFacilities(prev => prev.map(f => f.id === id ? { ...f, assignedSpecialist: specialist } : f));
  };

  const updateEnrollmentStatus = (id: number, status: StatusType) => {
    setEnrollments(prev => prev.map(e => e.id === id ? { ...e, status: status as any } : e));
  };

  const assignEnrollmentSpecialist = (id: number, specialist: string) => {
    setEnrollments(prev => prev.map(e => e.id === id ? { ...e, assignedSpecialist: specialist } : e));
  };

  const isSuperAdmin = currentPersona.role === 'SUPER_ADMIN';
  const isAdmin = currentPersona.role === 'ADMIN' || isSuperAdmin;
  const isSpecialist = currentPersona.role === 'CREDENTIALING_SPECIALIST';
  const activeRoleDef = roles.find(r => r.name === currentPersona.role);
  const isAssignedOnly = isSpecialist || activeRoleDef?.dataScope === 'ASSIGNED_ONLY';

  return (
    <AppContext.Provider
      value={{
        currentPersona,
        switchPersona,
        personas,
        roles,
        createRole,
        updateRole,
        deleteRole,
        users,
        updateUserRole,
        providers,
        updateProviderStatus,
        assignProviderSpecialist,
        facilities,
        updateFacilityStatus,
        assignFacilitySpecialist,
        enrollments,
        updateEnrollmentStatus,
        assignEnrollmentSpecialist,
        availableSpecialists,
        isSuperAdmin,
        isAdmin,
        isSpecialist,
        isAssignedOnly
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

