
import React, { useState } from 'react';
import type { RegisteredUser } from '../App';
import type { SwapRequest } from '../types';

interface LoginScreenProps {
  allUsers: SwapRequest[];
  onLogin: (userData: RegisteredUser | 'admin') => void;
  onGoToRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ allUsers, onLogin, onGoToRegister }) => {
    const [employeeId, setEmployeeId] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLoginAttempt = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const id = employeeId.trim();
        if (!id) {
            setError('Por favor, introduce tu número de empleado.');
            return;
        }

        if (id.toLowerCase() === 'admin') {
            onLogin('admin');
            return;
        }

        // In a real app, this would be an API call. For the demo, we check our list.
        const user = allUsers.find(u => u.employeeId === id);

        if (user) {
            const { id: swapId, has, wants, ...registeredUserData } = user;
            onLogin(registeredUserData);
        } else {
            setError('Número de empleado no encontrado. Por favor, regístrate si eres nuevo.');
        }
    };

    return (
        <div className="max-w-sm mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg">
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
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Tu nº de empleado o 'admin'"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-lg">{error}</p>}
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
        </div>
    );
};

export default LoginScreen;
