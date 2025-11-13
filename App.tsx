
import React, { useState, useEffect } from 'react';
import VacationSwapApp from './components/VacationSwapApp';
import LoginScreen from './components/LoginScreen';
import RegistrationScreen from './components/RegistrationScreen';
import AdminDashboard from './components/AdminDashboard';
import AppSelector from './components/AppSelector';
import RestSwapApp from './components/RestSwapApp';
import TablonAnunciosApp from './components/TablonAnunciosApp';
import type { SwapRequest } from './types';
import { allRequestsEverForDemo } from './constants';

export type RegisteredUser = Omit<SwapRequest, 'id' | 'has' | 'wants'>;

const UserMenu: React.FC<{ user: RegisteredUser | null; isAdmin: boolean; onLogout: () => void; isSimulating: boolean; }> = ({ user, isAdmin, onLogout, isSimulating }) => {
    const [isOpen, setIsOpen] = useState(false);
    const name = isAdmin ? 'Administrador' : user?.employeeName || 'Usuario';

    let logoutText = isAdmin ? 'Salir del Panel' : 'Cambiar de Usuario';
    if (isSimulating) {
        logoutText = 'Volver al Panel de Admin';
    }

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
                <span className="font-semibold hidden sm:inline">Hola, {name.split(' ')[0]}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 bg-gray-200 rounded-full p-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                         {isSimulating ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                         ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                         )}
                        {logoutText}
                    </button>
                </div>
            )}
        </div>
    );
};


const App: React.FC = () => {
  const [registeredUser, setRegisteredUser] = useState<RegisteredUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [simulatingFromAdmin, setSimulatingFromAdmin] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<SwapRequest[]>([]);

  useEffect(() => {
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
  };

  const handleRegister = (userData: RegisteredUser) => {
    const newUserAsSwapRequest: SwapRequest = {
        ...userData,
        id: userData.employeeId,
        has: [],
        wants: [],
    };
    
    const updatedAllUsers = [...allUsers, newUserAsSwapRequest];
    setAllUsers(updatedAllUsers);
    localStorage.setItem('employeePortalAllUsers', JSON.stringify(updatedAllUsers));

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
    // If the simulation was started by an admin, set the flag. Otherwise, it's a user-to-user simulation.
    setSimulatingFromAdmin(isAdminInitiated);
    setSelectedApp('vacations');
  };

  const renderContent = () => {
    if (!registeredUser && !isAdmin) {
      if (authView === 'login') {
        return <LoginScreen allUsers={allUsers} onLogin={handleLogin} onGoToRegister={() => setAuthView('register')} />;
      }
      return <RegistrationScreen allUsers={allUsers} onRegister={handleRegister} onGoToLogin={() => setAuthView('login')} />;
    }

    if (isAdmin && !simulatingFromAdmin) {
        return <AdminDashboard allUsers={allUsers} onSimulateUser={handleSimulateUser} />;
    }

    if (!registeredUser) return null;
    
    if (!selectedApp) {
        return <AppSelector onSelectApp={setSelectedApp} />;
    }

    switch (selectedApp) {
        case 'vacations':
            return <VacationSwapApp 
                        registeredUser={registeredUser} 
                        onSimulateUser={handleSimulateUser}
                    />;
        case 'rest':
            return <RestSwapApp registeredUser={registeredUser} />;
        case 'board':
            return <TablonAnunciosApp registeredUser={registeredUser} />;
        case 'shift':
             return (
                <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto">
                    <h2 className="text-2xl font-bold text-gray-700">Próximamente</h2>
                    <p className="text-gray-500 mt-2">La funcionalidad de 'Cambio de Servicio' está en construcción.</p>
                    <button 
                        onClick={() => setSelectedApp(null)}
                        className="mt-6 bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                    >
                        Volver al Menú
                    </button>
                </div>
            );
        default:
            return <AppSelector onSelectApp={setSelectedApp} />;
    }
  }

  const showUserMenu = registeredUser || isAdmin;

  return (
    <div className="min-h-screen bg-gray-100">
       <header className="bg-white shadow-sm py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex-1">
              {selectedApp && !isAdmin && !simulatingFromAdmin && (
                <button
                  onClick={() => setSelectedApp(null)}
                  className="flex items-center text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                  Volver al Menú
                </button>
              )}
            </div>
            <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center">
                    Portal del Empleado
                </h1>
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
