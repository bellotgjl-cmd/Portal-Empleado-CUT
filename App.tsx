

import * as React from 'react';
import VacationSwapApp from './components/VacationSwapApp';
import LoginScreen from './components/LoginScreen';
import RegistrationScreen from './components/RegistrationScreen';
import AdminDashboard from './components/AdminDashboard';
import type { SwapRequest, RegisteredUser } from './types';
import { allRequestsEverForDemo } from './constants';
import AppSelector from './components/AppSelector';
import RestSwapApp from './components/RestSwapApp';
import TablonAnunciosApp from './components/TablonAnunciosApp';
import UserMenu from './components/UserMenu';


const App: React.FC = () => {
  const [registeredUser, setRegisteredUser] = React.useState<RegisteredUser | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [simulatingFromAdmin, setSimulatingFromAdmin] = React.useState(false);
  const [authView, setAuthView] = React.useState<'login' | 'register'>('login');
  const [allUsers, setAllUsers] = React.useState<SwapRequest[]>([]);
  const [selectedApp, setSelectedApp] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem('employeePortalUser');
      if (storedUser === 'admin') {
        setIsAdmin(true);
        setRegisteredUser(null);
      } else if (storedUser) {
        setRegisteredUser(JSON.parse(storedUser));
        setIsAdmin(false);
      }

      const storedAllUsers = localStorage.getItem('employeePortalAllUsers');
      if (storedAllUsers) {
        setAllUsers(JSON.parse(storedAllUsers));
      } else {
        setAllUsers(allRequestsEverForDemo);
      }

    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
      localStorage.removeItem('employeePortalUser');
      setAllUsers(allRequestsEverForDemo);
    }
  }, []);
  
  const handleUpdateUsers = (updatedUsers: SwapRequest[]) => {
      setAllUsers(updatedUsers);
      localStorage.setItem('employeePortalAllUsers', JSON.stringify(updatedUsers));
  };

  const handleLogin = (userData: RegisteredUser | 'admin') => {
    if (userData === 'admin') {
        localStorage.setItem('employeePortalUser', 'admin');
        setIsAdmin(true);
        setRegisteredUser(null);
    } else {
        localStorage.setItem('employeePortalUser', JSON.stringify(userData));
        setRegisteredUser(userData);
        setIsAdmin(false);
    }
    setSelectedApp(null);
  };

  const handleRegister = (userData: RegisteredUser) => {
    const newUserAsSwapRequest: SwapRequest = {
        ...userData,
        id: userData.employeeId,
        has: [],
        wants: [],
        status: 'active',
    };
    
    const updatedAllUsers = [...allUsers, newUserAsSwapRequest];
    handleUpdateUsers(updatedAllUsers);

    // For this demo, registering just logs the user in directly.
    handleLogin(userData);
  };

  const handleLogout = () => {
      if (simulatingFromAdmin) {
        setRegisteredUser(null);
        setIsAdmin(true);
        setSimulatingFromAdmin(false);
      } else {
        localStorage.removeItem('employeePortalUser');
        setRegisteredUser(null);
        setIsAdmin(false);
        setAuthView('login');
      }
      setSelectedApp(null);
  }

  const handleSimulateUser = (userToSimulate: RegisteredUser) => {
    const isAdminInitiated = isAdmin;
    setRegisteredUser(userToSimulate);
    setIsAdmin(false);
    setSimulatingFromAdmin(isAdminInitiated);
    setSelectedApp(null);
  };

  const handleSelectApp = (app: string) => {
    setSelectedApp(app);
  };

  const handleBackToMenu = () => {
    setSelectedApp(null);
  };

  const renderContent = () => {
    if (!registeredUser && !isAdmin) {
      if (authView === 'login') {
        return <LoginScreen allUsers={allUsers} onLogin={handleLogin} onGoToRegister={() => setAuthView('register')} />;
      }
      return <RegistrationScreen allUsers={allUsers} onRegister={handleRegister} onGoToLogin={() => setAuthView('login')} />;
    }

    if (isAdmin && !simulatingFromAdmin) {
        return <AdminDashboard allUsers={allUsers} onSimulateUser={handleSimulateUser} onUpdateUsers={handleUpdateUsers} />;
    }

    if (!registeredUser) return null;
    
    if (!selectedApp) {
      return <AppSelector onSelectApp={handleSelectApp} />;
    }

    switch (selectedApp) {
      case 'vacations':
        return <VacationSwapApp registeredUser={registeredUser} onSimulateUser={handleSimulateUser} allUsers={allUsers} />;
      case 'rest':
        return <RestSwapApp registeredUser={registeredUser} />;
      case 'board':
        return <TablonAnunciosApp registeredUser={registeredUser} allUsers={allUsers} />;
      case 'shift':
      default:
        return (
          <div className="text-center py-10 px-6 bg-white rounded-xl shadow-lg">
            <h3 className="text-lg font-medium text-gray-500">Aplicación no disponible.</h3>
            <button onClick={handleBackToMenu} className="mt-4 bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-indigo-700">
              Volver al menú
            </button>
          </div>
        );
    }
  }

  const showUserMenu = registeredUser || isAdmin;

  let activeUserName: string | null = null;
  if (isAdmin && !simulatingFromAdmin) {
    activeUserName = 'Administrador';
  } else if (registeredUser) {
    activeUserName = registeredUser.employeeName;
  }

  return (
    <div className="min-h-screen bg-gray-100">
       <header className="bg-white shadow-sm py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex-1">
              {selectedApp && registeredUser && !simulatingFromAdmin && (
                  <button onClick={handleBackToMenu} className="flex items-center text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                      </svg>
                      Volver al Menú
                  </button>
              )}
            </div>
            <div className="flex-1 text-center">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                    Portal del Empleado
                </h1>
                {activeUserName && (
                  <p className="text-sm font-medium text-indigo-600 mt-1" aria-live="polite">
                      Usuario en línea: {activeUserName}
                  </p>
                )}
            </div>
            <div className="flex-1 flex justify-end">
                {showUserMenu && <UserMenu user={registeredUser} isAdmin={isAdmin} onLogout={handleLogout} isSimulating={simulatingFromAdmin} />}
            </div>
        </div>
         {simulatingFromAdmin && registeredUser && (
            <div className="bg-yellow-400 text-yellow-900 font-bold text-center py-1 text-sm mt-2">
                Modo Simulación: Viendo como {registeredUser.employeeName}
            </div>
        )}
      </header>
      
      <main className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;