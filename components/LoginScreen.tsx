
import * as React from 'react';
import type { RegisteredUser } from '../types';
import type { SwapRequest } from '../types';
import { ADMINISTRATORS, DEMO_USERS } from '../constants';

interface LoginScreenProps {
  allUsers: SwapRequest[];
  onLogin: (userData: RegisteredUser | 'admin') => void;
  onGoToRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ allUsers, onLogin, onGoToRegister }) => {
    const [employeeId, setEmployeeId] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);

    const handleLoginAttempt = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const id = employeeId.trim();
        const pass = password.trim();

        if (!id || !pass) {
            setError('Por favor, introduce tu número de empleado y contraseña.');
            return;
        }

        if (id.toLowerCase() === 'admin') {
            // Simple hardcoded check for demo admin purposes
            if (pass === 'admin') {
                onLogin('admin');
            } else {
                setError('Contraseña de administrador incorrecta.');
            }
            return;
        }

        // Find user in the "allUsers" list which acts as our database for requests/users
        // However, types.ts defines RegisteredUser with password, but SwapRequest does NOT have password.
        // We need to retrieve the full RegisteredUser object from localStorage for authentication
        // because SwapRequests in allUsers might be public info.
        
        // Strategy: Try to find in localStorage 'employeePortalAllUsers' BUT that stores SwapRequest.
        // We need to check if we have the password stored. 
        // In a real backend, we query the DB. Here, we have to rely on how App.tsx stores users.
        // App.tsx stores `allUsers` as `SwapRequest[]`. We lost the password there in the previous refactor?
        // No, let's check App.tsx handleRegister.
        // Issue: handleRegister converts userData to SwapRequest. SwapRequest (types.ts) does NOT have password.
        // FIX: We must access the 'password' property which might exist on the object even if typescript hides it,
        // OR we should have stored RegisteredUsers separately.
        
        // For this implementation, we will cast the object found in allUsers to 'any' or 'RegisteredUser' to check password.
        const user = allUsers.find(u => u.employeeId === id);

        if (user) {
            // In a real app, use bcrypt. Here, direct comparison.
            // We cast to any because SwapRequest interface doesn't officially have password, but the object stored might.
            const storedUserWithAuth = user as any;
            
            if (storedUserWithAuth.password && storedUserWithAuth.password !== pass) {
                setError('Contraseña incorrecta.');
                return;
            }

            if (user.status === 'blocked') {
                const activeAdmin = ADMINISTRATORS.find(a => a.id === localStorage.getItem('activeAdminId')) || ADMINISTRATORS.find(a => a.role === 'master');
                const adminContact = activeAdmin ? `Contacto del administrador: ${activeAdmin.email} / ${activeAdmin.whatsapp}` : "Contacta con el administrador.";
                setError(`Tu cuenta ha sido bloqueada. Razón: ${user.blockReason || 'No especificada'}. ${adminContact}`);
                return;
            }

            // Reconstruct RegisteredUser object
            const registeredUserData: RegisteredUser = {
                employeeId: user.employeeId,
                employeeName: user.employeeName,
                employeeType: user.employeeType,
                email: user.email,
                whatsapp: user.whatsapp,
                initialAssignment: storedUserWithAuth.initialAssignment || [], // Recover assignment
                password: storedUserWithAuth.password
            };
            
            onLogin(registeredUserData);
        } else {
            setError('Usuario no encontrado. Por favor, regístrate.');
        }
    };

    const handleDemoLogin = (demoUser: any) => {
         const registeredUserData: RegisteredUser = {
            employeeId: demoUser.employeeId,
            employeeName: demoUser.employeeName,
            employeeType: demoUser.employeeType,
            email: demoUser.email,
            whatsapp: demoUser.whatsapp,
            initialAssignment: demoUser.initialAssignment || [],
            password: demoUser.password
        };
        onLogin(registeredUserData);
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-teal-600">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Iniciar Sesión</h2>
                <form onSubmit={handleLoginAttempt} className="space-y-4">
                    <div>
                        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
                            Número de Empleado
                        </label>
                        <input
                            type="text"
                            id="employeeId"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Tu nº de empleado"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-lg">{error}</p>}
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        Entrar
                    </button>
                </form>
                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <p className="text-gray-600">¿No tienes cuenta?</p>
                    <button
                        onClick={onGoToRegister}
                        className="mt-2 inline-block bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-green-700 transition-colors"
                    >
                        Regístrate Aquí
                    </button>
                </div>
            </div>

            {/* DEMO MODE QUICK LOGIN */}
            <div className="mt-8 bg-gray-100 p-6 rounded-xl border border-gray-300">
                <h3 className="text-center text-gray-600 font-bold mb-4 uppercase text-xs tracking-widest">Modo Demostración</h3>
                <p className="text-xs text-center text-gray-500 mb-4">Selecciona un usuario para entrar y actuar como él.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DEMO_USERS.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => handleDemoLogin(user)}
                            className="text-left px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-teal-50 hover:border-teal-300 transition-colors shadow-sm group"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-700 group-hover:text-teal-700 truncate">
                                    {user.employeeName.split(' (')[0]}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 group-hover:text-teal-600">
                                {user.employeeType}
                            </div>
                        </button>
                    ))}
                </div>
                
                <button
                    onClick={() => onLogin('admin')}
                    className="w-full text-left px-4 py-3 bg-gray-800 border border-gray-900 rounded-md hover:bg-gray-700 transition-colors flex justify-between items-center text-white mt-4 shadow-md"
                >
                    <span className="text-sm font-medium">Administrador</span>
                    <span className="text-xs text-gray-300 bg-gray-700 px-2 py-0.5 rounded">Master</span>
                </button>
            </div>
        </div>
    );
};

export default LoginScreen;
