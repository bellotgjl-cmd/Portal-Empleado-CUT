
import * as React from 'react';
import type { RegisteredUser } from '../types';
import type { RestSwapRequest, Debt } from '../types';
import RestDayCalendar from './RestDayCalendar';
import RequestBoard from './RequestBoard';
import DebtManager from './DebtManager';
import SwapProposalModal from './SwapProposalModal';
import DebtSettlementModal from './DebtSettlementModal';
import VacationCalendarView from './VacationCalendarView';
import { initialRestRequests, initialDebts } from '../constants';

interface RestSwapAppProps {
    registeredUser: RegisteredUser;
}

const RestSwapApp: React.FC<RestSwapAppProps> = ({ registeredUser }) => {
    const [requests, setRequests] = React.useState<RestSwapRequest[]>(initialRestRequests);
    const [myOfferedDays, setMyOfferedDays] = React.useState<string[]>([]);
    const [myReason, setMyReason] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const [view, setView] = React.useState<'request' | 'board' | 'debts' | 'calendar'>('board');
    const [boardView, setBoardView] = React.useState<'active' | 'successful' | 'expired'>('active');
    const [debts, setDebts] = React.useState<Debt[]>(initialDebts);
    const [managingRequest, setManagingRequest] = React.useState<RestSwapRequest | null>(null);
    const [settlingDebt, setSettlingDebt] = React.useState<Debt | null>(null);

    React.useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const updatedRequests = requests.map(req => {
            if (req.status === 'active') {
                const allDaysPast = req.offeredDays.every(dayString => {
                    const dayDate = new Date(dayString);
                    const adjustedDayDate = new Date(dayDate.valueOf() + dayDate.getTimezoneOffset() * 60 * 1000);
                    return adjustedDayDate < today;
                });
                if (allDaysPast) {
                    return { ...req, status: 'expired' as const };
                }
            }
            return req;
        });

        if (JSON.stringify(updatedRequests) !== JSON.stringify(requests)) {
            setRequests(updatedRequests);
        }
    }, []);

    const handleDayToggle = (day: string) => {
        setMyOfferedDays(prev => 
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSubmit = () => {
        if (myOfferedDays.length === 0 || myReason.trim() === '') {
            setError('Debes seleccionar al menos un día y escribir un motivo para publicar.');
            return;
        }

        const newRequest: RestSwapRequest = {
            id: `rest-${new Date().toISOString()}`,
            employeeId: registeredUser.employeeId,
            employeeName: `${registeredUser.employeeName} (${registeredUser.employeeType})`,
            employeeType: registeredUser.employeeType,
            offeredDays: myOfferedDays,
            reason: myReason,
            createdAt: Date.now(),
            status: 'active',
        };

        setRequests(prev => [newRequest, ...prev].sort((a,b) => b.createdAt - a.createdAt));
        setMyOfferedDays([]);
        setMyReason('');
        setError(null);
        setView('board');
        setBoardView('active');
    };
    
    const markRequestAsSuccessful = (requestId: string) => {
        setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'successful' } : r));
    }

    const handleCreateDebt = (creditorRequest: RestSwapRequest) => {
        const newDebt: Debt = {
            id: `debt-${Date.now()}`,
            debtorId: registeredUser.employeeId,
            debtorName: registeredUser.employeeName,
            creditorId: creditorRequest.employeeId,
            creditorName: creditorRequest.employeeName.split(' (')[0],
            originalRequestId: creditorRequest.id,
            createdAt: Date.now(),
        };
        setDebts(prev => [...prev, newDebt]);
        markRequestAsSuccessful(creditorRequest.id);
        setManagingRequest(null);
    };
    
    const handleProposeSwap = (creditorRequest: RestSwapRequest, offeredDay: string) => {
        alert(`Propuesta enviada a ${creditorRequest.employeeName} para cambiar su día por tu ${new Date(offeredDay).toLocaleDateString('es-ES')}. (Funcionalidad de notificación pendiente)`);
        markRequestAsSuccessful(creditorRequest.id);
        setManagingRequest(null);
    };

    const handleSettleDebt = (debtId: string, proposedDate: string) => {
        const debtToSettle = debts.find(d => d.id === debtId);
        if (debtToSettle) {
            alert(`Propuesta para saldar la deuda con ${debtToSettle.creditorName} enviada para el día ${new Date(proposedDate).toLocaleDateString('es-ES')}. (Simulación: la deuda se eliminará de la lista)`);
            setDebts(prev => prev.filter(d => d.id !== debtId));
            setSettlingDebt(null);
        }
    };
    
     const getTabClasses = (tabName: 'request' | 'board' | 'debts' | 'calendar') => {
        const baseClasses = "px-6 py-2 font-bold text-lg rounded-t-lg transition-colors duration-300 focus:outline-none";
        if (view === tabName) {
            return `${baseClasses} bg-white text-teal-600 shadow-md`;
        }
        return `${baseClasses} bg-gray-200 text-gray-600 hover:bg-gray-300`;
    };
    
     const getBoardTabClasses = (tabName: 'active' | 'successful' | 'expired') => {
        const baseClasses = "px-4 py-2 font-semibold text-sm rounded-md transition-colors duration-200 focus:outline-none";
        if (boardView === tabName) {
            return `${baseClasses} bg-teal-600 text-white shadow`;
        }
        return `${baseClasses} bg-gray-200 text-gray-700 hover:bg-gray-300`;
    };

    const relevantRequests = requests.filter(r => r.employeeType === registeredUser.employeeType);
    const activeRequests = relevantRequests.filter(r => r.status === 'active');
    const successfulRequests = relevantRequests.filter(r => r.status === 'successful');
    const expiredRequests = relevantRequests.filter(r => r.status === 'expired');

    return (
        <>
        <div className="max-w-7xl mx-auto">
            <header className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 inline-flex items-center justify-center flex-wrap gap-x-3">
                    <span>CAMBIO DE DESCANSO</span>
                    <span className="text-2xl font-semibold text-gray-500">({registeredUser.employeeType})</span>
                </h1>
                <p className="mt-3 text-lg text-gray-600 max-w-3xl mx-auto">
                    Publica días de descanso que ofreces, o gestiona intercambios con tus compañeros.
                </p>
            </header>

            <nav className="flex space-x-2 border-b-2 border-gray-200">
                <button onClick={() => setView('board')} className={getTabClasses('board')}>
                    Tablón de Anuncios
                </button>
                 <button onClick={() => setView('calendar')} className={getTabClasses('calendar')}>
                    Calendario
                </button>
                <button onClick={() => setView('request')} className={getTabClasses('request')}>
                    Mi Petición
                </button>
                <button onClick={() => setView('debts')} className={getTabClasses('debts')}>
                    Mis Deudas
                </button>
            </nav>

            <main className="bg-white p-6 sm:p-8 rounded-b-xl shadow-xl min-h-[60vh]">
                {view === 'request' && (
                    <section>
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-teal-500">
                            Publicar una Petición
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">1. Selecciona los días que ofreces:</h3>
                                <RestDayCalendar selectedDays={myOfferedDays} onDayToggle={handleDayToggle} />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="reason" className="block text-lg font-semibold text-gray-700 mb-2">
                                        2. Motivo de la Petición:
                                    </label>
                                    <textarea
                                        id="reason"
                                        value={myReason}
                                        onChange={(e) => setMyReason(e.target.value)}
                                        rows={6}
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
                                        placeholder="Ej: Necesito cambiar un día por un asunto familiar, ofrezco varias alternativas..."
                                    />
                                </div>
                                {error && <p className="text-red-500 text-center text-sm bg-red-100 p-3 rounded-lg">{error}</p>}
                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-teal-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform transform hover:scale-105"
                                >
                                    Publicar Petición
                                </button>
                            </div>
                        </div>
                    </section>
                )}
                
                {view === 'board' && (
                    <section>
                         <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-cyan-500">
                            <h2 className="text-3xl font-bold text-gray-800">
                                Peticiones
                            </h2>
                            <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
                                <button onClick={() => setBoardView('active')} className={getBoardTabClasses('active')}>
                                    Activas ({activeRequests.length})
                                </button>
                                <button onClick={() => setBoardView('successful')} className={getBoardTabClasses('successful')}>
                                    Exitosas ({successfulRequests.length})
                                </button>
                                <button onClick={() => setBoardView('expired')} className={getBoardTabClasses('expired')}>
                                    Caducadas ({expiredRequests.length})
                                </button>
                            </div>
                        </div>
                        
                        {boardView === 'active' && 
                            <RequestBoard 
                                requests={activeRequests} 
                                onManageSwap={(req) => setManagingRequest(req)}
                                currentUserId={registeredUser.employeeId}
                                listType="active"
                            />
                        }
                        {boardView === 'successful' && 
                            <RequestBoard 
                                requests={successfulRequests} 
                                onManageSwap={() => {}}
                                currentUserId={registeredUser.employeeId}
                                listType="successful"
                            />
                        }
                        {boardView === 'expired' && 
                            <RequestBoard 
                                requests={expiredRequests} 
                                onManageSwap={() => {}}
                                currentUserId={registeredUser.employeeId}
                                listType="expired"
                            />
                        }
                    </section>
                )}

                 {view === 'debts' && (
                    <section>
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-orange-500">
                            Gestor de Deudas
                        </h2>
                        <DebtManager 
                            debts={debts} 
                            currentUserId={registeredUser.employeeId} 
                            onSettleDebt={(debt) => setSettlingDebt(debt)}
                        />
                    </section>
                )}

                {view === 'calendar' && (
                    <section>
                         <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-teal-500">
                            Calendario de Disponibilidad
                        </h2>
                        <VacationCalendarView 
                            requests={activeRequests.filter(r => r.employeeId !== registeredUser.employeeId)}
                            onManageSwap={(req) => setManagingRequest(req)}
                        />
                    </section>
                )}
            </main>
        </div>
        {managingRequest && (
            <SwapProposalModal 
                request={managingRequest}
                onClose={() => setManagingRequest(null)}
                onCreateDebt={handleCreateDebt}
                onProposeSwap={handleProposeSwap}
            />
        )}
        {settlingDebt && (
            <DebtSettlementModal
                debt={settlingDebt}
                onClose={() => setSettlingDebt(null)}
                onSettle={handleSettleDebt}
            />
        )}
        </>
    );
};

export default RestSwapApp;
