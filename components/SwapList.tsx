


import React, { useState } from 'react';
import type { SwapRequest } from '../types';
import type { RegisteredUser } from '../App';
import { getFortnightLabel } from '../constants';

interface SwapListProps {
  requests: SwapRequest[];
  currentUserRequestId?: string | null;
  onSimulateUser?: (user: RegisteredUser) => void;
}

const FortnightPill: React.FC<{ id: string, color: string }> = ({ id, color }) => (
    <span className={`inline-block px-3 py-1 text-xs font-semibold text-white rounded-full ${color}`}>
        {getFortnightLabel(id)}
    </span>
);


const SwapList: React.FC<SwapListProps> = ({ requests, currentUserRequestId, onSimulateUser }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShare = (request: SwapRequest) => {
    const shareText = `Echa un vistazo a esta propuesta de intercambio de ${request.employeeName} en el Portal del Empleado. Tiene disponible "${request.has.map(getFortnightLabel).join(', ')}" y busca "${request.wants.map(getFortnightLabel).join(', ')}".`;
    
    navigator.clipboard.writeText(shareText).then(() => {
        alert('Enlace copiado');
        setCopiedId(request.id);
        setTimeout(() => setCopiedId(null), 2500); // Reset after 2.5 seconds
    }).catch(err => {
        console.error('Error al copiar el enlace: ', err);
        alert('No se pudo copiar el enlace.');
    });
  };
  
  if (requests.length === 0) {
    return (
      <div className="text-center py-10 px-6 bg-white rounded-xl shadow-lg">
        <h3 className="text-lg font-medium text-gray-500">No hay intercambios publicados todavía.</h3>
        <p className="text-sm text-gray-400">¡Sé el primero en publicar uno!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {requests.map(req => {
        const isCurrentUser = req.id === currentUserRequestId;
        const typePillColor = req.employeeType === 'Conductor' ? 'bg-cyan-100 text-cyan-800' : 'bg-orange-100 text-orange-800';
        return (
            <div key={req.id} className={`bg-white p-5 rounded-xl shadow-lg border ${isCurrentUser ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <h4 className="font-bold text-lg text-gray-800">{req.employeeName}</h4>
                        {isCurrentUser && (
                            <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Tú</span>
                        )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${typePillColor}`}>{req.employeeType}</span>
                       {copiedId === req.id ? (
                          <div className="flex items-center text-green-600 text-sm font-semibold">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Enlace copiado</span>
                          </div>
                      ) : (
                          <button
                              onClick={() => handleShare(req)}
                              className="text-gray-400 hover:text-indigo-600 transition-colors"
                              aria-label="Compartir intercambio"
                              title="Compartir intercambio"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                          </button>
                      )}
                    </div>
                </div>
            <div className="mt-4 space-y-3">
                <div>
                <p className="text-sm font-semibold text-green-700 mb-2">Tiene disponible:</p>
                <div className="flex flex-wrap gap-2">
                    {req.has.map(id => <FortnightPill key={id} id={id} color="bg-green-500" />)}
                </div>
                </div>
                <div>
                <p className="text-sm font-semibold text-blue-700 mb-2">Busca:</p>
                <div className="flex flex-wrap gap-2">
                    {req.wants.map(id => <FortnightPill key={id} id={id} color="bg-blue-500" />)}
                </div>
                </div>
            </div>
            {!isCurrentUser && onSimulateUser && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                    onClick={() => {
                        const { id, has, wants, ...userToSimulate } = req;
                        onSimulateUser(userToSimulate as RegisteredUser);
                    }}
                    className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 text-sm flex items-center justify-center shadow-md transition-all transform hover:scale-105"
                    title={`Simular vista de ${req.employeeName}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Tomar Control (Simular)
                </button>
              </div>
            )}
            </div>
        );
      })}
    </div>
  );
};

export default SwapList;