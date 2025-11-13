import React from 'react';
import type { RestSwapRequest } from '../types';

interface RequestBoardProps {
  requests: RestSwapRequest[];
  onManageSwap: (request: RestSwapRequest) => void;
  currentUserId: string;
  listType: 'active' | 'successful' | 'expired';
}

const DayPill: React.FC<{ day: string }> = ({ day }) => {
    const date = new Date(day);
    // Add time zone offset to avoid date shifting
    const adjustedDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
    const formattedDate = adjustedDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
    });
    return (
        <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-teal-500 rounded-full">
            {formattedDate}
        </span>
    );
};

const StatusPill: React.FC<{ status: RestSwapRequest['status'] }> = ({ status }) => {
    const statusInfo = {
        successful: { text: 'Exitoso', classes: 'bg-green-100 text-green-800' },
        expired: { text: 'Caducado', classes: 'bg-yellow-100 text-yellow-800' },
        active: { text: 'Activo', classes: 'bg-blue-100 text-blue-800' }
    };
    const { text, classes } = statusInfo[status] || { text: 'Desconocido', classes: 'bg-gray-100 text-gray-800' };
    return (
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${classes}`}>
            {text}
        </span>
    );
};

const EmptyState: React.FC<{ listType: RequestBoardProps['listType'] }> = ({ listType }) => {
    const messages = {
        active: {
            title: 'No hay peticiones activas.',
            subtitle: '¡Sé el primero en publicar una petición de cambio!'
        },
        successful: {
            title: 'No hay peticiones exitosas.',
            subtitle: 'Cuando un intercambio se complete, aparecerá aquí.'
        },
        expired: {
            title: 'No hay peticiones caducadas.',
            subtitle: 'Las peticiones cuyas fechas han pasado aparecerán aquí.'
        }
    };
    const { title, subtitle } = messages[listType];

    return (
         <div className="text-center py-10 px-6 bg-gray-50 rounded-xl shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-500">{title}</h3>
            <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
        </div>
    );
};


const RequestBoard: React.FC<RequestBoardProps> = ({ requests, onManageSwap, currentUserId, listType }) => {
  if (requests.length === 0) {
    return <EmptyState listType={listType} />;
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 -mr-2">
      {requests.map(req => {
        const isMyRequest = req.employeeId === currentUserId;
        return(
            <div key={req.id} className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-lg text-gray-800">{req.employeeName.split(' (')[0]}</h4>
                    <p className="text-xs text-gray-500">
                        Publicado el {new Date(req.createdAt).toLocaleDateString('es-ES')}
                    </p>
                </div>
                 <div className="flex items-center space-x-2">
                    {listType !== 'active' && <StatusPill status={req.status} />}
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${req.employeeType === 'Conductor' ? 'bg-cyan-100 text-cyan-800' : 'bg-orange-100 text-orange-800'}`}>{req.employeeType}</span>
                 </div>
            </div>

            <p className="mt-4 text-gray-700 bg-gray-50 p-3 rounded-md border">{req.reason}</p>

            <div className="mt-4">
                <p className="text-sm font-semibold text-teal-700 mb-2">Días ofrecidos:</p>
                <div className="flex flex-wrap gap-2">
                {req.offeredDays.map(day => <DayPill key={day} day={day} />)}
                </div>
            </div>

            {!isMyRequest && req.status === 'active' && (
                 <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                        onClick={() => onManageSwap(req)}
                        className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors text-sm"
                    >
                        Gestionar Cambio
                    </button>
                </div>
            )}
            </div>
        );
      })}
    </div>
  );
};

export default RequestBoard;