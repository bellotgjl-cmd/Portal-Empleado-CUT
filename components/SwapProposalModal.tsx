import React, { useState } from 'react';
import type { RestSwapRequest } from '../types';
import RestDayCalendar from './RestDayCalendar';

interface SwapProposalModalProps {
  request: RestSwapRequest;
  onClose: () => void;
  onCreateDebt: (request: RestSwapRequest) => void;
  onProposeSwap: (request: RestSwapRequest, offeredDay: string) => void;
}

const SwapProposalModal: React.FC<SwapProposalModalProps> = ({ request, onClose, onCreateDebt, onProposeSwap }) => {
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    
    const handleDayToggle = (day: string) => {
        // Allow selecting only one day for the proposal
        setSelectedDays(prev => prev.includes(day) ? [] : [day]);
    };

    const handlePropose = () => {
        if (selectedDays.length > 0) {
            onProposeSwap(request, selectedDays[0]);
        }
    };
    
    const offeredDaysString = request.offeredDays
        .map(day => new Date(day).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }))
        .join(', ');

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 className="text-2xl font-bold text-gray-800">
                        Gestionar cambio con {request.employeeName.split(' (')[0]}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto flex-grow pr-2">
                    <p className="mb-6 text-gray-600">
                        Estás respondiendo a la petición de <strong>{request.employeeName.split(' (')[0]}</strong> para cambiar su(s) día(s) de descanso: <strong className="text-teal-600">{offeredDaysString}</strong>.
                    </p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Option 1: Propose a specific date */}
                        <div className="flex flex-col p-4 border rounded-lg bg-gray-50">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Opción 1: Proponer un cambio con fecha</h4>
                            <p className="text-sm text-gray-600 mb-4 flex-grow">Selecciona uno de tus días de descanso para ofrecérselo a cambio.</p>
                            <div className="mb-4">
                                <RestDayCalendar selectedDays={selectedDays} onDayToggle={handleDayToggle} />
                            </div>
                            <button
                                onClick={handlePropose}
                                disabled={selectedDays.length === 0}
                                className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Proponer Día
                            </button>
                        </div>

                        {/* Option 2: Accept and create a debt */}
                         <div className="flex flex-col p-4 border rounded-lg bg-gray-50">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Opción 2: Aceptar y quedar en deuda</h4>
                            <p className="text-sm text-gray-600 mb-4 flex-grow">
                                Si necesitas el día que ofrece pero no puedes concretar una fecha de devolución ahora mismo, puedes aceptar su día y generar una deuda de 1 día de descanso a su favor.
                            </p>
                            <button
                                onClick={() => onCreateDebt(request)}
                                className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-700"
                            >
                                Aceptar y Generar Deuda
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SwapProposalModal;
