import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CredentialApplications } from './pages/CredentialApplications';
import { DocumentVerification } from './pages/DocumentVerification';
import { EnrollmentApplications } from './pages/EnrollmentApplications';
import { UsersManagement } from './pages/UsersManagement';
import { PlansPricing } from './pages/PlansPricing';
import { CreditsManagement } from './pages/CreditsManagement';
import { SubscriptionsOrders } from './pages/SubscriptionsOrders';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('credential-applications');
  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('verification')) {
      setActiveTab('document-verification');
    } else if (path.includes('enrollment')) {
      setActiveTab('enrollment-applications');
    } else if (path.includes('users')) {
      setActiveTab('users-accounts');
    } else if (path.includes('plans')) {
      setActiveTab('plans-pricing');
    } else if (path.includes('credits')) {
      setActiveTab('credits-management');
    } else if (path.includes('orders')) {
      setActiveTab('subscriptions-orders');
    }
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    let path = '/';
    switch (tabId) {
      case 'document-verification':
        path = '/verification';
        break;
      case 'enrollment-applications':
        path = '/enrollment-application';
        break;
      case 'users-accounts':
        path = '/users';
        break;
      case 'plans-pricing':
        path = '/plans';
        break;
      case 'credits-management':
        path = '/credits';
        break;
      case 'subscriptions-orders':
        path = '/orders';
        break;
      default:
        path = '/';
    }
    window.history.pushState({}, '', path);
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'credential-applications':
        return <CredentialApplications />;
      case 'document-verification':
        return <DocumentVerification />;
      case 'enrollment-applications':
        return <EnrollmentApplications />;
      case 'users-accounts':
        return <UsersManagement />;
      case 'plans-pricing':
        return <PlansPricing />;
      case 'credits-management':
        return <CreditsManagement />;
      case 'subscriptions-orders':
        return <SubscriptionsOrders />;
      default:
        return <CredentialApplications />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header with Live Persona Switcher */}
        <Header />

        {/* Dynamic Screen Page */}
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
