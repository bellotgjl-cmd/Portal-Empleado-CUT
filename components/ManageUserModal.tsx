import React, { useState } from 'react';
import type { SwapRequest, RegisteredUser } from '../types';

interface ManageUserModalProps {
  user: SwapRequest;
  onClose: () => void;
  onBlock: (userId: string, reason: string) => void;
  onUnblock: (userId: string) => void;
  onSimulateUser: (user: RegisteredUser) => void;
}

const ManageUserModal: React.FC<ManageUserModalProps> = ({ user, onClose, onBlock, onUnblock, onSimulateUser }) => {
  const [reason, setReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

  const handleBlockClick = () => {
    if (reason.trim()) {
      onBlock(user.id, reason.trim());
    }
  };
  
  const handleSimulateClick = () => {
      const { id, has, wants, status, blockReason, ...userToSimulate } = user;
      onSimulateUser(userToSimulate);
      onClose();
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
        onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h3 className="text-2xl font-bold text-gray-800">Gestionar a {user.employeeName}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="space-y-4">
            <div>
                <h4 className="font-semibold">Detalles del Usuario:</h4>
                <p className="text-sm text-gray-600"><strong>ID Empleado:</strong> {user.employeeId}</p>
                <p className="text-sm text-gray-600"><strong>Email:</strong> {user.email}</p>
                <p className="text-sm text-gray-600"><strong>WhatsApp:</strong> {user.whatsapp}</p>
                <p className="text-sm text-gray-600">
                    <strong>Estado:</strong> 
                    <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${user.status === 'blocked' ? 'bg-red-200 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {user.status === 'blocked' ? 'Bloqueado' : 'Activo'}
                    </span>
                </p>
                {user.status === 'blocked' && user.blockReason && (
                    <p className="text-sm text-gray-600 mt-1">
                        <strong>Motivo del bloqueo:</strong> <span className="italic">{user.blockReason}</span>
                    </p>
                )}
            </div>
            
            <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Acciones:</h4>
                <div className="space-y-3">
                    {user.status === 'active' ? (
                        <div>
                            {!showReasonInput ? (
                                <button onClick={() => setShowReasonInput(true)} className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-red-700">
                                    Bloquear Usuario
                                </button>
                            ) : (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <label htmlFor="blockReason" className="block text-sm font-medium text-gray-700">Motivo del bloqueo:</label>
                                    <textarea
                                        id="blockReason"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        rows={2}
                                        className="mt-1 w-full text-sm px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
                                        placeholder="Ej: Publicación de contenido inapropiado"
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button onClick={() => setShowReasonInput(false)} className="text-sm bg-gray-200 text-gray-800 px-3 py-1 rounded-md">Cancelar</button>
                                        <button onClick={handleBlockClick} disabled={!reason.trim()} className="text-sm bg-red-600 text-white px-3 py-1 rounded-md disabled:bg-gray-400">Confirmar Bloqueo</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                         <button onClick={() => onUnblock(user.id)} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-700">
                            Desbloquear Usuario
                        </button>
                    )}
                     <button onClick={handleSimulateClick} className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700">
                        Simular Vista de Usuario
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUserModal;