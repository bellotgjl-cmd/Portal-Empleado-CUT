
import React, { useState } from 'react';
import type { RegisteredUser } from '../types';

const UserMenu: React.FC<{ user: RegisteredUser | null; isAdmin: boolean; onLogout: () => void; isSimulating: boolean; }> = ({ user, isAdmin, onLogout, isSimulating }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    let logoutText = isAdmin ? 'Salir del Panel' : 'Cambiar de Usuario';
    if (isSimulating) {
        logoutText = 'Volver al Panel de Admin';
    }

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-teal-600 transition-colors"
            >
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

export default UserMenu;
