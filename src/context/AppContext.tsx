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
  addUser: (userData: { name: string; email: string; role: RoleType; phone?: string; organization?: string }) => void;
  updateUserRole: (userId: number, newRole: RoleType) => void;
  
  providers: ProviderApplication[];
  updateProviderStatus: (id: number, status: StatusType) => void;
  assignProviderSpecialist: (id: number, specialist: string) => void;
  
  facilities: FacilityApplication[];
  updateFacilityStatus: (id: string, status: StatusType) => void;
  assignFacilitySpecialist: (id: string, specialist: string) => void;
  
  enrollments: EnrollmentRecord[];
  addEnrollment: (enrollment: Omit<EnrollmentRecord, 'id'>) => void;
  updateEnrollmentStatus: (id: number, status: string) => void;
  assignEnrollmentSpecialist: (id: number, specialist: string) => void;
  updateEnrollmentDetails: (id: number, updates: Partial<EnrollmentRecord>) => void;

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

  const addUser = (userData: { name: string; email: string; role: RoleType; phone?: string; organization?: string }) => {
    const newUser: UserRecord = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '+1 (555) 000-0000',
      organization: userData.organization || 'Mantra Care',
      country: 'United States',
      countryFlag: '🇺🇸',
      service: 'Credentialing',
      signupDate: 'Oct 30, 2026',
      role: userData.role,
      status: 'Active',
      credits: { used: 0, total: 100 }
    };
    setUsers(prev => [newUser, ...prev]);
    setRoles(prev => prev.map(r => r.name === userData.role ? { ...r, userCount: r.userCount + 1 } : r));
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
            organization: targetProvider.organization,
            service: targetProvider.service,
            state: "New York (NY)",
            type: "Commercial",
            payer: "Aetna (Primary)",
            priority: "Standard",
            status: "PENDING",
            dateOfSubmission: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            referenceNumber: `REF-${Date.now() % 10000}`,
            followUpDate: "In 14 days",
            responsibleUser: specialist,
            effectiveDate: "Pending",
            recredentialingDate: "—",
            providerInsuranceId: `AET-NY-${Date.now() % 10000}`,
            notes: "Enrollment initialized via specialist assignment.",
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            insurance: "Aetna (Primary)",
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

  const addEnrollment = (data: Omit<EnrollmentRecord, 'id'>) => {
    const newRecord: EnrollmentRecord = {
      id: Math.floor(1000 + Math.random() * 90000),
      ...data,
      date: data.dateOfSubmission,
      insurance: data.payer,
      assignedSpecialist: data.responsibleUser
    };
    setEnrollments(prev => [newRecord, ...prev]);
  };

  const updateEnrollmentStatus = (id: number, status: string) => {
    setEnrollments(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  };

  const assignEnrollmentSpecialist = (id: number, specialist: string) => {
    setEnrollments(prev => prev.map(e => e.id === id ? { ...e, assignedSpecialist: specialist, responsibleUser: specialist } : e));
  };

  const updateEnrollmentDetails = (id: number, updates: Partial<EnrollmentRecord>) => {
    setEnrollments(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
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
        addUser,
        updateUserRole,
        providers,
        updateProviderStatus,
        assignProviderSpecialist,
        facilities,
        updateFacilityStatus,
        assignFacilitySpecialist,
        enrollments,
        addEnrollment,
        updateEnrollmentStatus,
        assignEnrollmentSpecialist,
        updateEnrollmentDetails,
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

