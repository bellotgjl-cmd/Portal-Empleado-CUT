
import React from 'react';
import { initialRequests, initialTransactions, allRequestsEverForDemo } from '../constants';
import type { SwapRequest, Transaction } from '../types';
import type { RegisteredUser } from '../App';
import { getFortnightLabel } from '../constants';

const getStatusPill = (status: Transaction['status']) => {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        expired: 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
}

interface AdminDashboardProps {
    allUsers: SwapRequest[];
    onSimulateUser: (user: RegisteredUser) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ allUsers, onSimulateUser }) => {

    const findUserNameById = (id: string): string => {
        const user = allUsers.find(u => u.id === id);
        return user ? user.employeeName : 'Usuario Desc.';
    };
    
    return (
        <div className="max-w-7xl mx-auto">
            <header className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
                    Panel de Administrador
                </h1>
                <p className="mt-3 text-lg text-gray-600 max-w-3xl mx-auto">
                    Vista global de la actividad de intercambio de vacaciones.
                </p>
            </header>

            <main className="space-y-12">
                 <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Usuarios Registrados ({allUsers.length})</h2>
                    <div className="bg-white rounded-xl shadow-xl overflow-x-auto">
                       <Table>
                            <Header>
                                <Th>Nombre</Th>
                                <Th>Tipo</Th>
                                <Th>Solicitud Activa</Th>
                                <Th>Acciones</Th>
                            </Header>
                            <tbody>
                                {allUsers.map(user => {
                                    const activeRequest = initialRequests.find(req => req.id === user.id);
                                    const hasStr = activeRequest ? activeRequest.has.map(getFortnightLabel).join(', ') : 'N/A';
                                    const wantsStr = activeRequest ? activeRequest.wants.map(getFortnightLabel).join(', ') : 'N/A';

                                    return (
                                        <Tr key={user.id}>
                                            <Td>
                                                <div>{user.employeeName}</div>
                                                <div className="text-xs text-gray-500">ID: {user.employeeId}</div>
                                            </Td>
                                            <Td>{user.employeeType}</Td>
                                            <Td>
                                                {activeRequest ? (
                                                    <div className="text-xs">
                                                        <p><span className="font-semibold">Tiene:</span> {hasStr}</p>
                                                        <p><span className="font-semibold">Quiere:</span> {wantsStr}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">No</span>
                                                )}
                                            </Td>
                                            <Td>
                                                <button
                                                    onClick={() => {
                                                        const { id, has, wants, ...userToSimulate } = user;
                                                        onSimulateUser(userToSimulate as RegisteredUser);
                                                    }}
                                                    className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 text-sm flex items-center shadow-md transition-all transform hover:scale-105"
                                                    title={`Simular vista de ${user.employeeName}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    Simular
                                                </button>
                                            </Td>
                                        </Tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                </section>
                
                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Historial de Transacciones ({initialTransactions.length})</h2>
                     <div className="bg-white rounded-xl shadow-xl overflow-x-auto">
                        <Table>
                            <Header>
                                <Th>Iniciador</Th>
                                <Th>Receptor</Th>
                                <Th>Intercambio</Th>
                                <Th>Estado</Th>
                                <Th>Fecha</Th>
                            </Header>
                            <tbody>
                                {initialTransactions.map(t => (
                                    <Tr key={t.id}>
                                        <Td>{findUserNameById(t.initiatorId)}</Td>
                                        <Td>{findUserNameById(t.receiverId)}</Td>
                                        <Td>
                                            <span className="font-semibold">{getFortnightLabel(t.initiatorGives[0])}</span>
                                            <span className="mx-2 text-gray-400">→</span>
                                            <span className="font-semibold">{getFortnightLabel(t.receiverGives[0])}</span>
                                        </Td>
                                        <Td>{getStatusPill(t.status)}</Td>
                                        <Td>{new Date(t.timestamp).toLocaleString('es-ES')}</Td>
                                    </Tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </section>
            </main>
        </div>
    );
};

// Helper components for styling tables
const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => <table className="min-w-full divide-y divide-gray-200">{children}</table>;
const Header: React.FC<{ children: React.ReactNode }> = ({ children }) => <thead className="bg-gray-50"><tr>{children}</tr></thead>;
const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>;
const Tr: React.FC<{ children: React.ReactNode }> = ({ children }) => <tr className="even:bg-white odd:bg-gray-50">{children}</tr>;
const Td: React.FC<{ children: React.ReactNode }> = ({ children }) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-top">{children}</td>;

export default AdminDashboard;
