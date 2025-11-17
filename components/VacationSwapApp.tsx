

import * as React from 'react';
import SwapForm from './SwapForm';
import SwapList from './SwapList';
import MatchList from './MatchList';
import QuickMatchFinder from './QuickMatchFinder';
import TransactionHistory from './TransactionHistory';
import SuccessStories from './SuccessStories';
import type { SwapRequest, Match, Transaction, TransactionStatus, TradeProposal, RegisteredUser } from '../types';
import { initialRequests, initialTransactions } from '../constants';

// --- LocalStorage Keys ---
const LS_KEYS = {
  REQUESTS: 'portal_vacation_requests',
  TRANSACTIONS: 'portal_vacation_transactions',
  NOTIFICATION_PREFIX: 'portal_vacation_notification_',
};


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


interface VacationSwapAppProps {
    registeredUser: RegisteredUser;
    onSimulateUser: (user: RegisteredUser) => void;
    allUsers: SwapRequest[];
}

const VacationSwapApp: React.FC<VacationSwapAppProps> = ({ registeredUser, onSimulateUser, allUsers }) => {
  const [swapRequests, setSwapRequests] = React.useState<SwapRequest[]>(() => {
    try {
      const stored = localStorage.getItem(LS_KEYS.REQUESTS);
      return stored ? JSON.parse(stored) : initialRequests;
    } catch {
      return initialRequests;
    }
  });
  
  const [currentUserRequest, setCurrentUserRequest] = React.useState<SwapRequest | null>(null);

  const [transactions, setTransactions] = React.useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(LS_KEYS.TRANSACTIONS);
      return stored ? JSON.parse(stored) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [lastSeenMatchCount, setLastSeenMatchCount] = React.useState(0);
  const [newMatchesCount, setNewMatchesCount] = React.useState(0);
  const [lastTransactionStatus, setLastTransactionStatus] = React.useState<{id: string, status: TransactionStatus} | null>(null);
  const [loginNotification, setLoginNotification] = React.useState<string | null>(null);
  const [view, setView] = React.useState<'dashboard' | 'explore' | 'success'>('dashboard');
  const [lastActiveUserId, setLastActiveUserId] = React.useState<string | null>(null);
  const [highlightedTransactionId, setHighlightedTransactionId] = React.useState<string | null>(null);
  const [scrollToSection, setScrollToSection] = React.useState<string | null>(null);


  React.useEffect(() => {
    localStorage.setItem(LS_KEYS.REQUESTS, JSON.stringify(swapRequests));
  }, [swapRequests]);

  React.useEffect(() => {
    localStorage.setItem(LS_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);


  React.useEffect(() => {
    // Check if the registered user already has a request in the list and set it as active.
    const existingRequest = swapRequests.find(req => req.employeeId === registeredUser.employeeId);
    if (existingRequest) {
        setCurrentUserRequest(existingRequest);
    } else {
        // If the logged-in user has no active request (e.g., after a successful swap), set it to null.
        setCurrentUserRequest(null);
    }
    
    // Clear notifications when user changes
    setLoginNotification(null);
    setLastTransactionStatus(null);

  }, [registeredUser, swapRequests]);

  React.useEffect(() => {
    if (view !== 'success') {
      setHighlightedTransactionId(null);
    }
  }, [view]);

  // Effect to scroll to a specific section when requested
  React.useEffect(() => {
    if (scrollToSection) {
        setTimeout(() => { // Timeout to allow DOM to update
            const element = document.getElementById(scrollToSection);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('animate-pulse-strong');
                setTimeout(() => element.classList.remove('animate-pulse-strong'), 3000);
            }
            setScrollToSection(null); // Reset after scroll
        }, 100);
    }
  }, [scrollToSection]);


  // Effect to check for incoming proposals on login/user change
  React.useEffect(() => {
    if (currentUserRequest) {
      // 1. Check for incoming proposal to show immediately
      const incomingProposal = transactions.find(t =>
          t.receiverId === currentUserRequest.id && t.status === 'pending'
      );

      if (incomingProposal) {
        const initiator = allUsers.find(u => u.id === incomingProposal.initiatorId);
        setLoginNotification(`¡Atención! ${initiator?.employeeName || 'Un compañero'} te ha enviado una propuesta. Revisa tus coincidencias.`);
        setView('dashboard'); // Force view to dashboard
        setScrollToSection(`match-card-${incomingProposal.initiatorId}`);
      } else {
         // 2. Check for notifications from past actions if no proposal is active
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
  }, [currentUserRequest, transactions, allUsers]);


  const activeTransaction = React.useMemo(() => {
    if (!currentUserRequest) return null;
    return transactions.find(t => 
        (t.initiatorId === currentUserRequest.id || t.receiverId === currentUserRequest.id) && 
        t.status === 'pending'
    ) || null;
  }, [transactions, currentUserRequest]);


  const handlePublishOrUpdateSwap = (formData: Pick<SwapRequest, 'has' | 'wants'>) => {
    if (currentUserRequest) {
      // Update existing request
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
      // Create new request for the registered user
      const newRequest: SwapRequest = {
        ...registeredUser,
        ...formData,
        id: registeredUser.employeeId, // Use a stable ID
        status: 'active',
      };
      
      const updatedRequests = [newRequest, ...swapRequests];
      setSwapRequests(updatedRequests);
      setCurrentUserRequest(newRequest);
      setLastSeenMatchCount(0);
      setNewMatchesCount(0);
      setLastActiveUserId(null);

      // --- Smart Redirection Logic ---
      const newMatches = findMatches(newRequest, updatedRequests);
      if (newMatches.length > 0) {
        setView('dashboard');
        setScrollToSection('matches-section'); // Trigger scroll to matches
      } else {
        setView('explore'); // No matches, encourage exploration
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
      setView('dashboard'); // Stay on dashboard to see the pending transaction
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
      setLoginNotification(null); // Clear login notification on action
      setTransactions(prev => prev.map(t => 
          t.id === transactionId ? { ...t, status: newStatus } : t
      ));
      setLastTransactionStatus({ id: transactionId, status: newStatus });

      if (newStatus === 'confirmed') {
        const confirmedTransaction = transactions.find(t => t.id === transactionId);
        if (confirmedTransaction) {
            setSwapRequests(prev => prev.filter(req => req.id !== confirmedTransaction.initiatorId && req.id !== confirmedTransaction.receiverId));
            if (currentUserRequest?.id === confirmedTransaction.initiatorId || currentUserRequest?.id === confirmedTransaction.receiverId) {
                setLastActiveUserId(currentUserRequest.id);
                setCurrentUserRequest(null);
            }
        }
        setHighlightedTransactionId(transactionId);
        setView('success'); // --- REDIRECT TO SUCCESS STORIES ---
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
            message = '¡Intercambio confirmado! Vuestras solicitudes han sido retiradas de la lista.';
            bgColor = 'bg-green-100 border-green-500';
            textColor = 'text-green-700';
            break;
        case 'rejected':
            message = 'El intercambio fue rechazado. Ahora puedes seleccionar otra coincidencia.';
            bgColor = 'bg-red-100 border-red-500';
            textColor = 'text-red-700';
            break;
        case 'expired':
            message = 'El tiempo para responder ha expirado. Ahora puedes seleccionar otra coincidencia.';
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

  const getTabClasses = (tabName: 'dashboard' | 'explore' | 'success') => {
    const baseClasses = "relative px-6 py-2 font-bold text-lg rounded-t-lg transition-colors duration-300 focus:outline-none";
    if (view === tabName) {
      return `${baseClasses} bg-white text-indigo-600 shadow-md`;
    }
    return `${baseClasses} bg-gray-200 text-gray-600 hover:bg-gray-300`;
  };

  // Create a base request from registered user data for the form
  const newRequestBase = {
      ...registeredUser,
      id: '', // No ID yet for a new request
      has: [],
      wants: []
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="text-center mb-10">
         <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 inline-flex items-center justify-center flex-wrap gap-x-3">
            <span>CAMBIO VACACIONES</span>
             <span className="text-2xl font-semibold text-gray-500">({registeredUser.employeeType})</span>
        </h1>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
          Publica las quincenas que tienes y las que buscas, y encuentra coincidencias con tus compañeros de {registeredUser.employeeType}.
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
          Explorar ({registeredUser.employeeType})
        </button>
        <button onClick={() => setView('success')} className={getTabClasses('success')}>
          Casos de Éxito ✨
        </button>
      </nav>
      
      {view === 'dashboard' && (
        <main className="bg-white p-6 sm:p-8 rounded-b-xl shadow-xl">
          {currentUserRequest ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-gray-800 pb-2 border-b-2 border-indigo-500">
                        Tu Solicitud Actual
                    </h2>
                    <SwapForm onSubmit={handlePublishOrUpdateSwap} initialData={currentUserRequest} />
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
                            currentUserRequestId={currentUserRequest.id}
                            allRequests={allUsers}
                        />
                    </section>
                </div>
            </div>
          ) : (
            <div className="space-y-12">
                <section id="form-section">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-indigo-500">
                        Crear Nueva Solicitud
                    </h2>
                    {renderStatusMessage()}
                    <SwapForm onSubmit={handlePublishOrUpdateSwap} initialData={newRequestBase as SwapRequest} />
                </section>
                <div className="text-center py-10 px-6 bg-gray-50 rounded-xl shadow-inner">
                    <h3 className="text-lg font-medium text-gray-600">Bienvenido, {registeredUser.employeeName}.</h3>
                    <p className="text-sm text-gray-500 mt-2">Parece que no tienes ninguna solicitud de intercambio activa. ¡Crea una usando el formulario de arriba para empezar a buscar coincidencias!</p>
                </div>
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
                    allRequests={swapRequests.filter(r => r.employeeId !== registeredUser.employeeId)} 
                    currentUserType={registeredUser.employeeType}
                />
            </section>

            <section id="all-requests-section">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-gray-300">
                Intercambios Publicados ({registeredUser.employeeType})
              </h2>
              <SwapList 
                requests={swapRequests.filter(r => r.employeeType === registeredUser.employeeType)}
                currentUserRequestId={currentUserRequest?.id || null}
                onSimulateUser={onSimulateUser}
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
                  currentUserRequestId={registeredUser.employeeId}
                  highlightedTransactionId={highlightedTransactionId}
                  onSimulateUser={onSimulateUser}
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