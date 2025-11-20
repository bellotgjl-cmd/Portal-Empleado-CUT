
import * as React from 'react';
import SwapForm from './SwapForm';
import SwapList from './SwapList';
import MatchList from './MatchList';
import QuickMatchFinder from './QuickMatchFinder';
import TransactionHistory from './TransactionHistory';
import SuccessStories from './SuccessStories';
import FortnightSelector from './FortnightSelector';
import type { SwapRequest, Match, Transaction, TransactionStatus, TradeProposal, RegisteredUser, FortnightId } from '../types';
import { getFortnightLabel, initialRequests, MONTHS } from '../constants';

// --- LocalStorage Keys ---
const REAL_LS_KEYS = {
  REQUESTS: 'portal_vacation_requests',
  TRANSACTIONS: 'portal_vacation_transactions',
  NOTIFICATION_PREFIX: 'portal_vacation_notification_',
};

// Demo keys prefix
const DEMO_PREFIX = 'DEMO_SESSION_';


function findMatches(currentUser: SwapRequest, allRequests: SwapRequest[]): Match[] {
  const matches: Match[] = [];
  // Filter for other people of the same employee type
  const otherRequests = allRequests.filter(req => req.id !== currentUser.id && req.employeeType === currentUser.employeeType);

  for (const otherPerson of otherRequests) {
    const possibleGives = currentUser.has.filter(fortnight => otherPerson.wants.includes(fortnight));
    const possibleGets = otherPerson.has.filter(fortnight => currentUser.wants.includes(fortnight));
    
    const proposals: TradeProposal[] = [];
    if (possibleGives.length > 0 && possibleGets.length > 0) {
      // Create 1-for-1 trade proposals
      for (const give of possibleGives) {
        for (const get of possibleGets) {
          proposals.push({ give, get });
        }
      }
    }

    if (proposals.length > 0) {
      matches.push({ otherPerson, proposals });
    }
  }
  return matches;
}

// --- CORE LOGIC: LEDGER CALCULATION ---
function calculateCurrentHoldings(user: RegisteredUser, transactions: Transaction[]): FortnightId[] {
    let holdings = [...(user.initialAssignment || [])];
    
    const relevantTransactions = transactions.filter(t => 
        t.status === 'confirmed' && (t.initiatorId === user.employeeId || t.receiverId === user.employeeId)
    );

    relevantTransactions.forEach(t => {
        if (t.initiatorId === user.employeeId) {
            // I initiated. I gave 'initiatorGives', got 'receiverGives'
            holdings = holdings.filter(h => !t.initiatorGives.includes(h)); // Remove what I gave
            holdings.push(...t.receiverGives); // Add what I got
        } else {
            // I received. I gave 'receiverGives', got 'initiatorGives'
            holdings = holdings.filter(h => !t.receiverGives.includes(h)); // Remove what I gave
            holdings.push(...t.initiatorGives); // Add what I got
        }
    });

    return holdings;
}


interface VacationSwapAppProps {
    registeredUser: RegisteredUser;
    realUser: RegisteredUser | null; // The original user if in simulation mode
    onSimulateUser: (user: RegisteredUser) => void;
    allUsers: SwapRequest[];
    onUpdateUser: (user: RegisteredUser) => void;
    onStopSimulation?: () => void;
}

const VacationSwapApp: React.FC<VacationSwapAppProps> = ({ registeredUser, realUser, onSimulateUser, allUsers, onUpdateUser, onStopSimulation }) => {
  // --- DEMO MODE STATE ---
  const isDemoMode = !!realUser;
  const [demoView, setDemoView] = React.useState<'current' | 'real'>('current'); // 'current' = demo user, 'real' = my original file

  // Determine which user we are effectively managing based on the view toggle
  const effectiveUser = (isDemoMode && demoView === 'real' && realUser) ? realUser : registeredUser;
  
  // Determine Storage Keys
  const LS_KEYS = isDemoMode ? {
      REQUESTS: `${DEMO_PREFIX}requests`,
      TRANSACTIONS: `${DEMO_PREFIX}transactions`,
      NOTIFICATION_PREFIX: `${DEMO_PREFIX}notification_`,
  } : REAL_LS_KEYS;

  // --- SETUP STATE ---
  const [isSetupMode, setIsSetupMode] = React.useState(false);
  const [setupAssignment, setSetupAssignment] = React.useState<FortnightId[]>([]);
  const [setupError, setSetupError] = React.useState<string | null>(null);

  const [swapRequests, setSwapRequests] = React.useState<SwapRequest[]>(() => {
    try {
      const stored = localStorage.getItem(LS_KEYS.REQUESTS);
      if (stored) return JSON.parse(stored);
      
      // CLONE DATA: If demo mode and empty (fresh session), copy from REAL requests to initialize the sandbox
      if (isDemoMode) {
          const realStored = localStorage.getItem(REAL_LS_KEYS.REQUESTS);
          return realStored ? JSON.parse(realStored) : initialRequests;
      }
      return initialRequests;
    } catch {
      return initialRequests;
    }
  });
  
  const [currentUserRequest, setCurrentUserRequest] = React.useState<SwapRequest | null>(null);

  const [transactions, setTransactions] = React.useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(LS_KEYS.TRANSACTIONS);
      if (stored) return JSON.parse(stored);

      // CLONE DATA: Clone real transactions so the user can interact with pending actions initiated in real mode
      if (isDemoMode) {
          const realStored = localStorage.getItem(REAL_LS_KEYS.TRANSACTIONS);
          return realStored ? JSON.parse(realStored) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [lastSeenMatchCount, setLastSeenMatchCount] = React.useState(0);
  const [newMatchesCount, setNewMatchesCount] = React.useState(0);
  const [lastTransactionStatus, setLastTransactionStatus] = React.useState<{id: string, status: TransactionStatus} | null>(null);
  const [loginNotification, setLoginNotification] = React.useState<string | null>(null);
  const [view, setView] = React.useState<'dashboard' | 'explore' | 'success'>('dashboard');
  const [highlightedTransactionId, setHighlightedTransactionId] = React.useState<string | null>(null);
  const [scrollToSection, setScrollToSection] = React.useState<string | null>(null);

  // --- INTERNAL SIMULATION HANDLER ---
  // Intercepts simulation requests. If the user tries to "Act as" the Real User, we switch view locally.
  const handleInternalSimulateUser = (user: RegisteredUser) => {
      if (realUser && user.employeeId === realUser.employeeId) {
          setDemoView('real');
          // Ensure we are on dashboard to see pending actions
          setView('dashboard');
      } else if (user.employeeId === registeredUser.employeeId) {
          setDemoView('current');
      } else {
          // If switching to a completely different 3rd user, reset view to 'current' for that new user
          setDemoView('current');
          onSimulateUser(user);
      }
  };

  // --- CHECK ASSIGNMENT ON MOUNT ---
  React.useEffect(() => {
      if (!effectiveUser.initialAssignment || effectiveUser.initialAssignment.length === 0) {
          setIsSetupMode(true);
      } else {
          setIsSetupMode(false);
      }
  }, [effectiveUser]);


  // --- Calculated States ---
  const currentHoldings = React.useMemo(() => {
      return calculateCurrentHoldings(effectiveUser, transactions);
  }, [effectiveUser, transactions]);

  React.useEffect(() => {
    localStorage.setItem(LS_KEYS.REQUESTS, JSON.stringify(swapRequests));
  }, [swapRequests, LS_KEYS.REQUESTS]);

  React.useEffect(() => {
    localStorage.setItem(LS_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions, LS_KEYS.TRANSACTIONS]);


  React.useEffect(() => {
    const existingRequest = swapRequests.find(req => req.employeeId === effectiveUser.employeeId);
    if (existingRequest) {
        const stillOwnsAll = existingRequest.has.every(h => currentHoldings.includes(h));
        if (!stillOwnsAll) {
            const validHas = existingRequest.has.filter(h => currentHoldings.includes(h));
            const updatedRequest = { ...existingRequest, has: validHas };
            
            if (validHas.length === 0) {
                setSwapRequests(prev => prev.filter(r => r.id !== existingRequest.id));
                setCurrentUserRequest(null);
            } else {
                setSwapRequests(prev => prev.map(r => r.id === existingRequest.id ? updatedRequest : r));
                setCurrentUserRequest(updatedRequest);
            }
        } else {
            setCurrentUserRequest(existingRequest);
        }
    } else {
        setCurrentUserRequest(null);
    }
    
    setLoginNotification(null);
    setLastTransactionStatus(null);

  }, [effectiveUser, swapRequests, currentHoldings]);

  React.useEffect(() => {
    if (view !== 'success') {
      setHighlightedTransactionId(null);
    }
  }, [view]);

  React.useEffect(() => {
    if (scrollToSection) {
        setTimeout(() => {
            const element = document.getElementById(scrollToSection);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('animate-pulse-strong');
                setTimeout(() => element.classList.remove('animate-pulse-strong'), 3000);
            }
            setScrollToSection(null);
        }, 100);
    }
  }, [scrollToSection]);


  React.useEffect(() => {
    if (currentUserRequest) {
      const incomingProposal = transactions.find(t =>
          t.receiverId === currentUserRequest.id && t.status === 'pending'
      );

      if (incomingProposal) {
        const initiator = allUsers.find(u => u.id === incomingProposal.initiatorId);
        setLoginNotification(`¡Atención! ${initiator?.employeeName || 'Un compañero'} te ha enviado una propuesta. Revisa tus coincidencias.`);
        setView('dashboard');
        setScrollToSection(`match-card-${incomingProposal.initiatorId}`);
      } else {
        const notificationKey = `${LS_KEYS.NOTIFICATION_PREFIX}${currentUserRequest.id}`;
        try {
            const storedNotification = localStorage.getItem(notificationKey);
            if (storedNotification) {
                const { id, status } = JSON.parse(storedNotification);
                setLastTransactionStatus({ id, status });
                localStorage.removeItem(notificationKey);
            }
        } catch (e) {
            console.error('Error processing notification:', e);
            localStorage.removeItem(notificationKey);
        }
      }
    }
  }, [currentUserRequest, transactions, allUsers, LS_KEYS.NOTIFICATION_PREFIX]);


  const activeTransaction = React.useMemo(() => {
    if (!currentUserRequest) return null;
    return transactions.find(t => 
        (t.initiatorId === currentUserRequest.id || t.receiverId === currentUserRequest.id) && 
        t.status === 'pending'
    ) || null;
  }, [transactions, currentUserRequest]);


  // --- SETUP HANDLERS ---
  const handleToggleSetupAssignment = (id: FortnightId) => {
      setSetupAssignment(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  };

  const handleSaveSetup = () => {
      if (setupAssignment.length === 0) {
          setSetupError("Debes seleccionar al menos una quincena asignada.");
          return;
      }
      // Update the user via prop callback
      onUpdateUser({
          ...effectiveUser,
          initialAssignment: setupAssignment
      });
      setIsSetupMode(false);
  };


  const handlePublishOrUpdateSwap = (formData: Pick<SwapRequest, 'has' | 'wants'>) => {
    if (!formData.has.every(h => currentHoldings.includes(h))) {
        alert("Error de sincronización: Intentas publicar quincenas que ya no posees.");
        return;
    }

    if (currentUserRequest) {
      const updatedRequest: SwapRequest = {
        ...currentUserRequest,
        has: formData.has,
        wants: formData.wants,
      };
      setSwapRequests(prev =>
        prev.map(req => req.id === currentUserRequest.id ? updatedRequest : req)
      );
      setCurrentUserRequest(updatedRequest);
    } else {
      const newRequest: SwapRequest = {
        ...effectiveUser,
        ...formData,
        id: effectiveUser.employeeId,
        status: 'active',
      };
      
      const updatedRequests = [newRequest, ...swapRequests];
      setSwapRequests(updatedRequests);
      setCurrentUserRequest(newRequest);
      setLastSeenMatchCount(0);
      setNewMatchesCount(0);

      const newMatches = findMatches(newRequest, updatedRequests);
      if (newMatches.length > 0) {
        setView('dashboard');
        setScrollToSection('matches-section');
      } else {
        setView('explore');
      }
    }
  };

  const handleSelectMatch = (match: Match, proposal: TradeProposal) => {
      if (!currentUserRequest || activeTransaction) return;

      const newTransaction: Transaction = {
          id: `trans_${new Date().toISOString()}`,
          initiatorId: currentUserRequest.id,
          receiverId: match.otherPerson.id,
          initiatorGives: [proposal.give],
          receiverGives: [proposal.get],
          timestamp: Date.now(),
          status: 'pending',
      };
      setTransactions(prev => [...prev, newTransaction]);
      setView('dashboard');
      setScrollToSection(`match-card-${match.otherPerson.id}`);
  };

  const handleTransactionResponse = (transactionId: string, newStatus: Extract<TransactionStatus, 'confirmed' | 'rejected' | 'expired'>) => {
      const transaction = transactions.find(t => t.id === transactionId);
      if (transaction && currentUserRequest) {
        const otherUserId = transaction.initiatorId === currentUserRequest.id ? transaction.receiverId : transaction.initiatorId;
        const notificationKey = `${LS_KEYS.NOTIFICATION_PREFIX}${otherUserId}`;
        const notificationPayload = JSON.stringify({ id: transactionId, status: newStatus });
        localStorage.setItem(notificationKey, notificationPayload);
      }
      setLoginNotification(null);
      setTransactions(prev => prev.map(t => 
          t.id === transactionId ? { ...t, status: newStatus } : t
      ));
      setLastTransactionStatus({ id: transactionId, status: newStatus });

      if (newStatus === 'confirmed') {
        setHighlightedTransactionId(transactionId);
        setView('success');
      }
  };
  
  const handleFormalizeTransaction = (transactionId: string) => {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) return;

      // 1. Mark transaction as formalized
      setTransactions(prev => prev.map(t => 
          t.id === transactionId ? { ...t, formalized: true } : t
      ));

      // 2. Remove Swap Requests for BOTH users from the system ("Eliminar la publicación")
      const usersToRemove = [transaction.initiatorId, transaction.receiverId];
      setSwapRequests(prev => prev.filter(req => !usersToRemove.includes(req.employeeId)));

      // 3. Reset current user request if they were involved, forcing them to create a new one for future swaps
      if (usersToRemove.includes(effectiveUser.employeeId)) {
          setCurrentUserRequest(null);
      }
  };
  
  const matches = React.useMemo(() => {
    if (!currentUserRequest) return [];
    const foundMatches = findMatches(currentUserRequest, swapRequests);
    return foundMatches.sort((a, b) => 
      new Date(a.otherPerson.id).getTime() - new Date(b.otherPerson.id).getTime()
    );
  }, [currentUserRequest, swapRequests]);

  React.useEffect(() => {
    if (currentUserRequest) {
        const newCount = matches.length - lastSeenMatchCount;
        if (newCount > 0) {
            setNewMatchesCount(newCount);
        }
    } else {
        setNewMatchesCount(0);
        setLastSeenMatchCount(0);
    }
  }, [matches, lastSeenMatchCount, currentUserRequest]);


  const handleAcknowledgeMatches = () => {
      setNewMatchesCount(0);
      setLastSeenMatchCount(matches.length);
  };
  
  const renderLoginNotification = () => {
    if (!loginNotification) return null;
    return (
      <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-lg mb-4 shadow-md flex justify-between items-center" role="alert">
        <p className="font-bold text-blue-700">{loginNotification}</p>
        <button 
          onClick={() => setLoginNotification(null)}
          aria-label="Cerrar notificación"
          className="ml-4 p-1 rounded-full text-blue-700 hover:bg-black/10 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  };

  const renderStatusMessage = () => {
    if (!lastTransactionStatus) return null;
    
    let message = '';
    let bgColor = '';
    let textColor = '';

    switch(lastTransactionStatus.status) {
        case 'confirmed':
            message = '¡Intercambio confirmado! Tus propiedades se han actualizado.';
            bgColor = 'bg-green-100 border-green-500';
            textColor = 'text-green-700';
            break;
        case 'rejected':
            message = 'El intercambio fue rechazado.';
            bgColor = 'bg-red-100 border-red-500';
            textColor = 'text-red-700';
            break;
        case 'expired':
            message = 'El tiempo para responder ha expirado.';
            bgColor = 'bg-yellow-100 border-yellow-500';
            textColor = 'text-yellow-700';
            break;
        default:
            return null;
    }

    return (
        <div className={`${bgColor} border-l-4 p-4 rounded-lg mb-4 shadow-md flex justify-between items-center`} role="alert">
            <p className={`font-bold ${textColor}`}>{message}</p>
            <button 
                onClick={() => setLastTransactionStatus(null)}
                aria-label="Cerrar notificación"
                className={`ml-4 p-1 rounded-full ${textColor} hover:bg-black/10 transition-colors`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
  };
  
  const InventoryStatusPanel = () => {
      // Helper for sorting
      const chronologicalSort = (a: string, b: string) => {
          const getMonthIndex = (id: string) => {
              const monthPart = id.split('-')[0];
              return MONTHS.findIndex(m => m.toLowerCase() === monthPart);
          };
          const monthA = getMonthIndex(a);
          const monthB = getMonthIndex(b);
          return monthA !== monthB ? monthA - monthB : a.localeCompare(b);
      };

      // 1. Current Availability
      const activeIds = [...currentHoldings].sort(chronologicalSort);

      // 2. Changes History (Confirmed transactions)
      // Note: In Demo mode, this will naturally show the session history because 'transactions' is scoped to the session
      const changesHistory = transactions
          .filter(t => t.status === 'confirmed' && (t.initiatorId === effectiveUser.employeeId || t.receiverId === effectiveUser.employeeId))
          .map(t => {
              const isInitiator = t.initiatorId === effectiveUser.employeeId;
              return {
                  id: t.id,
                  gaveIds: isInitiator ? t.initiatorGives : t.receiverGives,
                  gotIds: isInitiator ? t.receiverGives : t.initiatorGives,
                  date: t.timestamp,
                  formalized: !!t.formalized
              };
          })
          .sort((a, b) => b.date - a.date);

      return (
          <div className={`border p-6 rounded-xl shadow-md mb-8 space-y-8 ${isDemoMode ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'}`}>
              
              {/* Section 1: Availability */}
              <div>
                  <div className="flex items-center justify-between mb-3 border-b pb-2 border-gray-200">
                    <h3 className="text-lg font-bold flex items-center text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Disponibilidad {isDemoMode ? '(Simulada)' : 'Actual'} de {effectiveUser.employeeName.split(' ')[0]}
                    </h3>
                    {isDemoMode && <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">SESIÓN DE PRUEBA</span>}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {activeIds.length > 0 ? (
                         activeIds.map(id => (
                            <div key={id} className="flex items-center px-4 py-2 rounded-lg bg-green-50 border border-green-500 text-green-800 shadow-sm">
                                <span className="font-bold text-sm">{getFortnightLabel(id)}</span>
                            </div>
                         ))
                    ) : (
                        <span className="text-gray-500 italic text-sm">No hay periodos disponibles actualmente.</span>
                    )}
                  </div>
              </div>

              {/* Section 2: Changes History */}
              <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center text-gray-800 border-b pb-2 border-gray-200">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-600" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Registro de Cambios {isDemoMode ? '(Sesión Demo)' : 'Efectuados'}
                  </h3>
                  <div className="space-y-3">
                    {changesHistory.length > 0 ? (
                        changesHistory.map((item) => (
                            <div key={item.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex-grow">
                                         <div className="flex items-center gap-2 mb-1">
                                             <span className="bg-red-100 text-red-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide">No Disponible</span>
                                             <span className="text-gray-400 text-sm line-through font-medium">{item.gaveIds.map(getFortnightLabel).join(', ')}</span>
                                         </div>
                                         <div className="text-gray-700 text-sm">
                                             <span className="font-medium text-gray-500">Mes asignado de origen:</span>{' '}
                                             <span className="font-bold text-gray-800">{item.gaveIds.map(getFortnightLabel).join(', ')}</span>{' '}
                                             <span className="text-gray-400 mx-1">→</span>{' '}
                                             <span className="font-medium text-gray-500">Cambiado por:</span>{' '}
                                             <span className="font-bold text-teal-600">{item.gotIds.map(getFortnightLabel).join(', ')}</span>
                                         </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end min-w-[120px] pl-4 border-l border-gray-100">
                                        <div className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString()}</div>
                                        <div className="mt-1">
                                            {item.formalized ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                  <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                                  Formalizado
                                                </span>
                                            ) : (
                                                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                                  Pendiente
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 italic p-2">
                            {isDemoMode ? 'Aún no has realizado movimientos en esta prueba.' : 'No se han realizado cambios de vacaciones.'}
                        </p>
                    )}
                  </div>
              </div>
          </div>
      )
  }

  const getTabClasses = (tabName: 'dashboard' | 'explore' | 'success') => {
    const baseClasses = "relative px-6 py-2 font-bold text-lg rounded-t-lg transition-colors duration-300 focus:outline-none";
    if (view === tabName) {
      return `${baseClasses} bg-white text-teal-600 shadow-md`;
    }
    return `${baseClasses} bg-gray-200 text-gray-600 hover:bg-gray-300`;
  };

  const newRequestBase = {
      ...effectiveUser,
      id: '', 
      has: [],
      wants: []
  };

  // --- RENDER SETUP SCREEN ---
  if (isSetupMode) {
      return (
          <div className="max-w-2xl mx-auto">
              <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-yellow-500">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Configuración Inicial {isDemoMode && '(Simulada)'}</h2>
                  <p className="text-gray-600 mb-6 text-lg">
                      Antes de acceder a las herramientas de intercambio, debes registrar las vacaciones que la empresa te ha asignado oficialmente.
                  </p>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="font-bold text-blue-800">¿Por qué es esto necesario?</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                El sistema utiliza un "Libro Mayor" para garantizar que nadie pueda intercambiar vacaciones que no posee. 
                                Esta asignación inicial es el punto de partida para validar tus futuros intercambios.
                            </p>
                        </div>
                      </div>
                  </div>

                  <h3 className="font-bold text-gray-800 mb-3 text-lg">Selecciona tu Asignación Original:</h3>
                  <div className="border p-4 rounded-lg bg-gray-50 max-h-96 overflow-y-auto mb-6">
                      <FortnightSelector selected={setupAssignment} onToggle={handleToggleSetupAssignment} />
                  </div>

                  {setupError && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                          <strong className="font-bold">Error: </strong>
                          <span className="block sm:inline">{setupError}</span>
                      </div>
                  )}

                  <button 
                      onClick={handleSaveSetup}
                      className="w-full bg-teal-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-teal-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                      Confirmar Asignación y Acceder
                  </button>
              </div>
          </div>
      )
  }

  // --- RENDER MAIN APP ---
  return (
    <div className="max-w-7xl mx-auto">
        {/* DEMO CONTROL BAR */}
        {isDemoMode && realUser && (
            <div className="bg-indigo-900 text-white p-4 rounded-xl shadow-lg mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="font-bold text-lg flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-400" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        MODO DEMO ACTIVADO
                    </h2>
                    <p className="text-xs text-indigo-200">Tus datos reales están protegidos. Todo lo que hagas aquí es simulado.</p>
                </div>
                
                <div className="flex bg-indigo-800 rounded-lg p-1">
                    <button 
                        onClick={() => setDemoView('current')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${demoView === 'current' ? 'bg-indigo-500 text-white shadow' : 'text-indigo-200 hover:text-white'}`}
                    >
                        Usuario Demo ({registeredUser.employeeName.split(' ')[0]})
                    </button>
                    <button 
                        onClick={() => setDemoView('real')}
                         className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${demoView === 'real' ? 'bg-indigo-500 text-white shadow' : 'text-indigo-200 hover:text-white'}`}
                    >
                        Mi Ficha Real ({realUser.employeeName.split(' ')[0]})
                    </button>
                </div>

                <button 
                    onClick={onStopSimulation}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Finalizar Prueba
                </button>
            </div>
        )}

      <header className="text-center mb-10">
         <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 inline-flex items-center justify-center flex-wrap gap-x-3">
            <span>CAMBIO VACACIONES</span>
             <span className="text-2xl font-semibold text-gray-500">({effectiveUser.employeeType})</span>
        </h1>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
          Gestiona tus quincenas asignadas de forma oficial y segura.
        </p>
      </header>

      <nav className="flex space-x-2 border-b-2 border-gray-200">
        <button onClick={() => setView('dashboard')} className={getTabClasses('dashboard')}>
          Mi Panel
          {newMatchesCount > 0 && (
            <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center text-xs font-bold ring-2 ring-white animate-pulse">
              {newMatchesCount}
            </span>
          )}
        </button>
        <button onClick={() => setView('explore')} className={getTabClasses('explore')}>
          Explorar ({effectiveUser.employeeType})
        </button>
        <button onClick={() => setView('success')} className={getTabClasses('success')}>
          Casos de Éxito ✨
        </button>
      </nav>
      
      {view === 'dashboard' && (
        <main className="bg-white p-6 sm:p-8 rounded-b-xl shadow-xl">
          
          <InventoryStatusPanel />

          {currentUserRequest ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-gray-800 pb-2 border-b-2 border-teal-500">
                        Tu Solicitud Actual
                    </h2>
                    <SwapForm onSubmit={handlePublishOrUpdateSwap} initialData={currentUserRequest} currentHoldings={currentHoldings} />
                </div>
                <div className="space-y-12">
                    <section id="matches-section">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-yellow-500 flex items-center gap-3 flex-wrap">
                        <span>Coincidencias ({matches.length})</span>
                        {newMatchesCount > 0 && !activeTransaction && (
                            <span className="animate-pulse bg-yellow-400 text-yellow-900 text-sm font-bold px-3 py-1 rounded-full">
                            {newMatchesCount} Nueva(s)
                            </span>
                        )}
                        </h2>
                        
                        {newMatchesCount > 0 && !activeTransaction && (
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-4 flex justify-between items-center shadow-md" role="alert">
                            <p className="font-bold">¡Tienes {newMatchesCount} nueva(s) coincidencia(s)!</p>
                            <button onClick={handleAcknowledgeMatches} aria-label="Cerrar notificación" className="text-green-700 hover:text-green-900 font-bold p-1 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        )}
                        
                        {renderLoginNotification()}
                        {renderStatusMessage()}

                        <MatchList 
                            matches={matches} 
                            currentUserRequestId={currentUserRequest.id}
                            activeTransaction={activeTransaction}
                            onSelectMatch={handleSelectMatch}
                            onAccept={(id) => handleTransactionResponse(id, 'confirmed')}
                            onReject={(id) => handleTransactionResponse(id, 'rejected')}
                            onExpire={(id) => handleTransactionResponse(id, 'expired')}
                        />
                    </section>
                    
                    <section id="history-section">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-gray-400">
                            Historial de Transacciones
                        </h2>
                        <TransactionHistory 
                            transactions={transactions}
                            currentUserRequestId={effectiveUser.employeeId}
                            allRequests={allUsers}
                        />
                    </section>
                </div>
            </div>
          ) : (
            <div className="space-y-12">
                <section id="form-section">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-teal-500">
                        Crear Nueva Solicitud
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Actualmente no tienes ninguna solicitud activa. Utiliza el formulario para indicar qué quieres cambiar.
                    </p>
                    {renderStatusMessage()}
                    <SwapForm onSubmit={handlePublishOrUpdateSwap} initialData={newRequestBase as SwapRequest} currentHoldings={currentHoldings} />
                </section>
                <section id="history-section">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-gray-400">
                        Historial de Transacciones
                    </h2>
                    <TransactionHistory 
                        transactions={transactions}
                        currentUserRequestId={effectiveUser.employeeId}
                        allRequests={allUsers}
                    />
                </section>
            </div>
          )}
        </main>
      )}

      {view === 'explore' && (
        <main className="space-y-12 bg-white p-6 sm:p-8 rounded-b-xl shadow-xl">
            <section id="quick-match-section">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-purple-500">
                Búsqueda Rápida
                </h2>
                <QuickMatchFinder 
                    allRequests={swapRequests.filter(r => r.employeeId !== effectiveUser.employeeId)} 
                    currentUserType={effectiveUser.employeeType}
                    onSimulateUser={handleInternalSimulateUser}
                />
            </section>

            <section id="all-requests-section">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-gray-300">
                Intercambios Publicados ({effectiveUser.employeeType})
              </h2>
              <SwapList 
                requests={swapRequests.filter(r => r.employeeType === effectiveUser.employeeType)}
                currentUserRequestId={currentUserRequest?.id || null}
                onSimulateUser={handleInternalSimulateUser}
              />
            </section>
        </main>
      )}

      {view === 'success' && (
         <section id="success-stories-section" className="bg-white p-6 sm:p-8 rounded-b-xl rounded-tr-xl shadow-xl">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-green-500">
                  Historial de Intercambios Exitosos
              </h2>
              <SuccessStories 
                  transactions={transactions}
                  allRequests={allUsers}
                  currentUserRequestId={effectiveUser.employeeId}
                  highlightedTransactionId={highlightedTransactionId}
                  onSimulateUser={handleInternalSimulateUser}
                  onFormalize={handleFormalizeTransaction}
              />
          </section>
      )}

      <footer className="text-center mt-16 py-6 border-t">
          <p className="text-gray-500">© {new Date().getFullYear()} Cambio de Vacaciones Quincenas. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default VacationSwapApp;
