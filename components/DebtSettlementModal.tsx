import React, { useState } from 'react';
import type { Debt } from '../types';
import RestDayCalendar from './RestDayCalendar';

interface DebtSettlementModalProps {
  debt: Debt;
  onClose: () => void;
  onSettle: (debtId: string, proposedDate: string) => void;
}

const DebtSettlementModal: React.FC<DebtSettlementModalProps> = ({ debt, onClose, onSettle }) => {
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    
    const handleDayToggle = (day: string) => {
        // Allow selecting only one day for the proposal
        setSelectedDays(prev => prev.includes(day) ? [] : [day]);
    };

    const handlePropose = () => {
        if (selectedDays.length > 0) {
            onSettle(debt.id, selectedDays[0]);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 className="text-2xl font-bold text-gray-800">
                        Saldar deuda con {debt.creditorName}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto flex-grow pr-2">
                    <p className="mb-4 text-gray-600">
                        Tienes una deuda de 1 día de descanso con <strong>{debt.creditorName}</strong>. Selecciona uno de tus días de descanso en el calendario para proponerle la devolución.
                    </p>
                    
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Selecciona un día para devolver</h4>
                        <RestDayCalendar selectedDays={selectedDays} onDayToggle={handleDayToggle} />
                    </div>
                </div>
                 <div className="mt-6 pt-6 border-t flex justify-end">
                    <button
                        onClick={handlePropose}
                        disabled={selectedDays.length === 0}
                        className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Proponer Fecha y Saldar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DebtSettlementModal;