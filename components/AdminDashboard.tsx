import React, { useState, useEffect } from 'react';
import { initialRequests, allRequestsEverForDemo, ADMINISTRATORS } from '../constants';
import type { SwapRequest, Administrator, RegisteredUser } from '../types';
import ManageUserModal from './ManageUserModal';

interface AdminDashboardProps {
    allUsers: SwapRequest[];
    onSimulateUser: (user: RegisteredUser) => void;
    onUpdateUsers: (updatedUsers: SwapRequest[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ allUsers, onSimulateUser, onUpdateUsers }) => {
    const [activeAdminId, setActiveAdminId] = useState<string>(() => {
        try {
            return localStorage.getItem('activeAdminId') || ADMINISTRATORS.find(a => a.role === 'master')?.id || '';
        } catch {
            return ADMINISTRATORS.find(a => a.role === 'master')?.id || '';
        }
    });
    
    const [managingUser, setManagingUser] = useState<SwapRequest | null>(null);

    useEffect(() => {
        localStorage.setItem('activeAdminId', activeAdminId);
    }, [activeAdminId]);

    const masterAdmin = ADMINISTRATORS.find(a => a.role === 'master');
    const activeAdmin = ADMINISTRATORS.find(a => a.id === activeAdminId);

    const handleSetAsActiveAdmin = (adminId: string) => {
        setActiveAdminId(adminId);
    };

    const handleBlockUser = (userId: string, reason: string) => {
        const updatedUsers = allUsers.map(u => u.id === userId ? { ...u, status: 'blocked' as const, blockReason: reason } : u);
        onUpdateUsers(updatedUsers);
        setManagingUser(null);
    };
    
    const handleUnblockUser = (userId: string) => {
        const updatedUsers = allUsers.map(u => u.id === userId ? { ...u, status: 'active' as const, blockReason: undefined } : u);
        onUpdateUsers(updatedUsers);
        setManagingUser(null);
    };

    return (
        <>
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
                        Panel de Administrador
                    </h1>
                    <p className="mt-3 text-lg text-gray-600 max-w-3xl mx-auto">
                        Gestión de roles, usuarios y seguridad de la plataforma.
                    </p>
                </header>

                <main className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Gestión de Administradores</h2>
                        <div className="bg-white p-6 rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold text-lg">Administrador Activo</h3>
                                <p className="text-gray-600">
                                    {activeAdmin ? `${activeAdmin.name} (${activeAdmin.email})` : 'Ninguno seleccionado'}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Delegar Rol Activo</h3>
                                <p className="text-sm text-gray-500 mb-2">Solo el Admin Máster puede cambiar al administrador activo.</p>
                                <div className="space-y-2">
                                    {ADMINISTRATORS.map(admin => (
                                        <button
                                            key={admin.id}
                                            onClick={() => handleSetAsActiveAdmin(admin.id)}
                                            disabled={masterAdmin?.id !== activeAdminId}
                                            className={`w-full text-left p-2 rounded-md border text-sm transition-colors ${
                                                activeAdminId === admin.id 
                                                ? 'bg-indigo-600 text-white border-indigo-600' 
                                                : 'bg-white hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed'
                                            }`}
                                        >
                                            <span className="font-bold">{admin.name}</span>
                                            {admin.role === 'master' && <span className="text-xs ml-2 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">Máster</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Usuarios Registrados ({allUsers.length})</h2>
                        <div className="bg-white rounded-xl shadow-xl overflow-x-auto">
                        <Table>
                                <Header>
                                    <Th>Nombre</Th>
                                    <Th>Tipo</Th>
                                    <Th>Contacto</Th>
                                    <Th>Estado</Th>
                                    <Th>Acciones</Th>
                                </Header>
                                <tbody>
                                    {allUsers.map(user => {
                                        const isBlocked = user.status === 'blocked';
                                        return (
                                            <Tr key={user.id} className={isBlocked ? 'bg-red-50' : ''}>
                                                <Td>
                                                    <div>{user.employeeName}</div>
                                                    <div className="text-xs text-gray-500">ID: {user.employeeId}</div>
                                                </Td>
                                                <Td>{user.employeeType}</Td>
                                                <Td>
                                                    <div className="text-xs">{user.email}</div>
                                                    <div className="text-xs">{user.whatsapp}</div>
                                                </Td>
                                                <Td>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isBlocked ? 'bg-red-200 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                        {isBlocked ? 'Bloqueado' : 'Activo'}
                                                    </span>
                                                </Td>
                                                <Td>
                                                    <button
                                                        onClick={() => setManagingUser(user)}
                                                        className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800 text-sm flex items-center shadow-md transition-all transform hover:scale-105"
                                                    >
                                                        Gestionar
                                                    </button>
                                                </Td>
                                            </Tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </section>
                </main>
            </div>
            {managingUser && (
                <ManageUserModal
                    user={managingUser}
                    onClose={() => setManagingUser(null)}
                    onBlock={handleBlockUser}
                    onUnblock={handleUnblockUser}
                    onSimulateUser={onSimulateUser}
                />
            )}
        </>
    );
};

// Helper components for styling tables
const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => <table className="min-w-full divide-y divide-gray-200">{children}</table>;
const Header: React.FC<{ children: React.ReactNode }> = ({ children }) => <thead className="bg-gray-50"><tr>{children}</tr></thead>;
const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>;
const Tr: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => <tr className={`${className} even:bg-white odd:bg-gray-50`}>{children}</tr>;
const Td: React.FC<{ children: React.ReactNode }> = ({ children }) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 align-top">{children}</td>;

export default AdminDashboard;