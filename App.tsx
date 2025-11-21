
import * as React from 'react';
import VacationSwapApp from './components/VacationSwapApp';
import LoginScreen from './components/LoginScreen';
import RegistrationScreen from './components/RegistrationScreen';
import AdminDashboard from './components/AdminDashboard';
import type { SwapRequest, RegisteredUser } from './types';
import { DEMO_USERS } from './constants';
import AppSelector from './components/AppSelector';
import RestSwapApp from './components/RestSwapApp';
import TablonAnunciosApp from './components/TablonAnunciosApp';
import UserMenu from './components/UserMenu';


const App: React.FC = () => {
  const [registeredUser, setRegisteredUser] = React.useState<RegisteredUser | null>(null);
  const [realUser, setRealUser] = React.useState<RegisteredUser | null>(null); // The actual user behind the simulation
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [simulatingFromAdmin, setSimulatingFromAdmin] = React.useState(false);
  const [authView, setAuthView] = React.useState<'login' | 'register'>('login');
  const [allUsers, setAllUsers] = React.useState<SwapRequest[]>([]);
  const [selectedApp, setSelectedApp] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem('employeePortalUser');
      const storedRealUser = localStorage.getItem('employeePortalRealUser'); // Load preserved real user

      if (storedUser === 'admin') {
        setIsAdmin(true);
        setRegisteredUser(null);
      } else if (storedUser) {
        setRegisteredUser(JSON.parse(storedUser));
        setIsAdmin(false);
      }

      if (storedRealUser) {
          setRealUser(JSON.parse(storedRealUser));
      }

      const storedAllUsers = localStorage.getItem('employeePortalAllUsers');
      if (storedAllUsers) {
        setAllUsers(JSON.parse(storedAllUsers));
      } else {
        // Initialize with DEMO USERS for testing
        setAllUsers(DEMO_USERS as unknown as SwapRequest[]);
        // Also save to LS so they persist across reloads until cleared
        localStorage.setItem('employeePortalAllUsers', JSON.stringify(DEMO_USERS));
      }

    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
      localStorage.removeItem('employeePortalUser');
      localStorage.removeItem('employeePortalRealUser');
      setAllUsers([]);
    }
  }, []);
  
  const handleUpdateUsersList = (updatedUsers: SwapRequest[]) => {
      setAllUsers(updatedUsers);
      localStorage.setItem('employeePortalAllUsers', JSON.stringify(updatedUsers));
  };

  // New function to update the current logged-in user's data (e.g., setting initialAssignment)
  const handleUpdateCurrentUser = (updatedUser: RegisteredUser) => {
      setRegisteredUser(updatedUser);
      localStorage.setItem('employeePortalUser', JSON.stringify(updatedUser));
      
      // Also update this user in the global list
      const updatedAllUsers = allUsers.map(u => {
          if (u.employeeId === updatedUser.employeeId) {
              // Merge the new data (like initialAssignment) into the storage object
              return { ...u, ...updatedUser, id: u.id }; 
          }
          return u;
      });
      handleUpdateUsersList(updatedAllUsers);
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
    // Ensure we clear any stale realUser on fresh login
    localStorage.removeItem('employeePortalRealUser');
    setRealUser(null);
    setSelectedApp(null);
  };

  const handleRegister = (userData: RegisteredUser) => {
    // When registering, we store the full object including password (in a real app, hash it)
    // We use 'as any' or extend SwapRequest type internally, but for now we store it as is.
    const newUserAsSwapRequest = {
        ...userData,
        id: userData.employeeId,
        has: [], // Swap Requests start empty
        wants: [],
        status: 'active',
    } as unknown as SwapRequest; // Force cast to allow extra props like password storage in LS
    
    const updatedAllUsers = [...allUsers, newUserAsSwapRequest];
    handleUpdateUsersList(updatedAllUsers);

    handleLogin(userData);
  };

  const handleLogout = () => {
      if (simulatingFromAdmin) {
        setRegisteredUser(null);
        setIsAdmin(true);
        setSimulatingFromAdmin(false);
      } else if (realUser) {
         // Stop Simulation logic: Restore real user
         
         // CRITICAL: Clear demo session data to ensure next session starts fresh with a new clone of real data
         // This ensures the 'handshake' between real and demo users works on every new simulation attempt.
         Object.keys(localStorage).forEach(key => {
             if(key.startsWith('DEMO_SESSION_')) {
                 localStorage.removeItem(key);
             }
         });

         setRegisteredUser(realUser);
         localStorage.setItem('employeePortalUser', JSON.stringify(realUser));
         setRealUser(null);
         localStorage.removeItem('employeePortalRealUser');
      } else {
        localStorage.removeItem('employeePortalUser');
        localStorage.removeItem('employeePortalRealUser');
        setRegisteredUser(null);
        setRealUser(null);
        setIsAdmin(false);
        setAuthView('login');
      }
      setSelectedApp(null);
  }

  const handleSimulateUser = (userToSimulate: RegisteredUser) => {
    const isAdminInitiated = isAdmin;
    
    if (isAdminInitiated) {
        // Admin simulating: keep "admin" state behind the scenes to allow going back
        setRegisteredUser(userToSimulate);
        setIsAdmin(false);
        setSimulatingFromAdmin(true);
        // Do NOT write to localStorage, so refresh restores admin
    } else {
        // Regular user simulating (Demo Mode):
        // 1. Save the current REAL user if not already saved
        if (!realUser && registeredUser) {
            setRealUser(registeredUser);
            localStorage.setItem('employeePortalRealUser', JSON.stringify(registeredUser));
        }

        // 2. Switch to the simulated user
        setRegisteredUser(userToSimulate);
        setIsAdmin(false);
        setSimulatingFromAdmin(false);
        
        // 3. Persist the simulated user as the "active" user in LS so refresh works
        localStorage.setItem('employeePortalUser', JSON.stringify(userToSimulate));
    }
    
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
        return <AdminDashboard allUsers={allUsers} onSimulateUser={handleSimulateUser} onUpdateUsers={handleUpdateUsersList} />;
    }

    if (!registeredUser) return null;
    
    if (!selectedApp) {
      return <AppSelector onSelectApp={handleSelectApp} />;
    }

    switch (selectedApp) {
      case 'vacations':
        return (
            <VacationSwapApp 
                registeredUser={registeredUser}
                realUser={realUser} 
                onSimulateUser={handleSimulateUser} 
                allUsers={allUsers}
                onUpdateUser={handleUpdateCurrentUser}
                onStopSimulation={handleLogout} 
            />
        );
      case 'rest':
        return <RestSwapApp registeredUser={registeredUser} />;
      case 'board':
        return <TablonAnunciosApp registeredUser={registeredUser} allUsers={allUsers} />;
      case 'shift':
      default:
        return (
          <div className="text-center py-10 px-6 bg-white rounded-xl shadow-lg">
            <h3 className="text-lg font-medium text-gray-500">Aplicación no disponible.</h3>
            <button onClick={handleBackToMenu} className="mt-4 bg-teal-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-teal-700">
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
       {/* Reverted Header: Stacked Layout, Taller Height */}
       <header className="bg-white shadow-sm sticky top-0 z-40 border-b-4 border-teal-600 h-[116px]">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex-1 flex items-center justify-start">
              {selectedApp && registeredUser && !simulatingFromAdmin && (
                  <button onClick={handleBackToMenu} className="flex items-center text-sm font-semibold text-gray-600 hover:text-teal-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                      </svg>
                      <span className="hidden sm:inline">Volver</span>
                  </button>
              )}
            </div>
            
            {/* Stacked Header Content */}
            <div className="flex-1 flex flex-col items-center justify-center">
                {/* Custom CUT Logo SVG - Restored Size */}
                <div className="flex-shrink-0 mb-1">
                    <svg viewBox="0 0 160 80" className="h-12 sm:h-14 w-auto" aria-label="CUT Logo">
                         {/* Sun Icon */}
                         <circle cx="30" cy="40" r="14" fill="#f59e0b" />
                         <path d="M30 18V10 M30 70V62 M8 40H0 M52 40H60 M14 24L8 18 M46 56L52 62 M14 56L8 62 M46 24L52 18" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                        {/* Top Arrow (Right) */}
                         <path d="M80 20 H 140" fill="none" stroke="#0d9488" strokeWidth="5" strokeLinecap="round" />
                         <path d="M130 12 L 140 20 L 130 28" fill="none" stroke="#0d9488" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                         {/* Text */}
                         <text x="110" y="55" textAnchor="middle" fill="#111827" fontSize="36" fontWeight="900" fontFamily="sans-serif" style={{letterSpacing: '4px'}}>CUT</text>
                        {/* Bottom Arrow (Left) */}
                         <path d="M140 70 H 80" fill="none" stroke="#0d9488" strokeWidth="5" strokeLinecap="round" />
                         <path d="M90 62 L 80 70 L 90 78" fill="none" stroke="#0d9488" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-none whitespace-nowrap">
                        Portal del Empleado
                    </h1>
                    {activeUserName && (
                      <p className="text-[10px] sm:text-xs font-bold text-teal-600 mt-0.5 truncate max-w-[150px]" aria-live="polite">
                          {activeUserName}
                      </p>
                    )}
                </div>
            </div>

            <div className="flex-1 flex justify-end">
                {showUserMenu && <UserMenu user={registeredUser} isAdmin={isAdmin} onLogout={handleLogout} isSimulating={simulatingFromAdmin || !!realUser} />}
            </div>
        </div>
      </header>
      
      {/* Status Banners */}
      {simulatingFromAdmin && registeredUser && (
          <div className="bg-yellow-400 text-yellow-900 font-bold text-center py-1 text-sm">
              Modo Simulación Admin: Viendo como {registeredUser.employeeName}
          </div>
      )}
      {realUser && !simulatingFromAdmin && registeredUser && (
            <div className="bg-indigo-500 text-white font-bold text-center py-1 text-sm flex justify-center items-center gap-2">
              <span>MODO DEMO ACTIVO: Actuando como {registeredUser.employeeName}</span>
          </div>
      )}
      
      <main className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
