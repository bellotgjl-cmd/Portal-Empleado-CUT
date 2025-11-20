
import * as React from 'react';
import type { SwapRequest } from '../types';
import type { RegisteredUser } from '../types';
import { getFortnightLabel, DEMO_USERS } from '../constants';

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
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

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

  const handleSimulateClick = (request: SwapRequest) => {
      if (!onSimulateUser) return;

      // Try to find the full user data in DEMO_USERS to get the correct initialAssignment
      const demoUser = DEMO_USERS.find(u => u.employeeId === request.employeeId);
      
      let userToSimulate: RegisteredUser;

      if (demoUser) {
          // Reconstruct RegisteredUser from demo data
          userToSimulate = {
              employeeId: demoUser.employeeId,
              employeeName: demoUser.employeeName,
              employeeType: demoUser.employeeType as any,
              email: demoUser.email,
              whatsapp: demoUser.whatsapp,
              initialAssignment: demoUser.initialAssignment,
              password: demoUser.password
          };
      } else {
          // If it's a newly registered user not in demo constants, construct it from the request
          // We assume 'has' is their initial assignment for simulation purposes if we don't have the record
          userToSimulate = {
              employeeId: request.employeeId,
              employeeName: request.employeeName,
              employeeType: request.employeeType,
              email: request.email,
              whatsapp: request.whatsapp,
              initialAssignment: request.has, // Fallback
              password: '123' // Dummy
          };
      }
      
      onSimulateUser(userToSimulate);
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
            <div key={req.id} className={`bg-white p-5 rounded-xl shadow-lg border relative ${isCurrentUser ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <h4 className="font-bold text-lg text-gray-800">{req.employeeName}</h4>
                        {isCurrentUser && (
                            <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Tú</span>
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
                              className="text-gray-400 hover:text-teal-600 transition-colors"
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

            {/* DEMO ACTION BUTTON */}
            {!isCurrentUser && onSimulateUser && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={() => handleSimulateClick(req)}
                        className="flex items-center space-x-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors border border-indigo-200"
                        title="Cambiar a este usuario para probar la app desde su perspectiva"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Actuar como {req.employeeName.split(' ')[0]}</span>
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
