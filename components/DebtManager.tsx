import React from 'react';
import type { Debt } from '../types';

interface DebtManagerProps {
  debts: Debt[];
  currentUserId: string;
  onSettleDebt: (debt: Debt) => void;
}

const DebtCard: React.FC<{ title: string; debts: Debt[]; perspective: 'creditor' | 'debtor', onSettleDebt: (debt: Debt) => void }> = ({ title, debts, perspective, onSettleDebt }) => (
    <div className="bg-gray-50 p-4 rounded-xl shadow-inner">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{title} ({debts.length})</h3>
        {debts.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No tienes deudas en esta categoría.</p>
        ) : (
            <ul className="space-y-3">
                {debts.map(debt => {
                    const otherPersonName = perspective === 'creditor' ? debt.debtorName : debt.creditorName;
                    const isDebtor = perspective === 'debtor';
                    
                    return (
                        <li key={debt.id} className="bg-white p-3 rounded-lg shadow-sm border flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-gray-700">{otherPersonName}</p>
                                <p className="text-xs text-gray-500">
                                    Generada el: {new Date(debt.createdAt).toLocaleDateString('es-ES')}
                                </p>
                            </div>
                            <button 
                                onClick={() => isDebtor && onSettleDebt(debt)}
                                disabled={!isDebtor}
                                className={`text-xs font-bold py-1 px-3 rounded-full transition-colors ${
                                    isDebtor 
                                    ? 'bg-green-600 text-white hover:bg-green-700' 
                                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                }`}
                                title={isDebtor ? "Proponer una fecha para devolver el día" : "El deudor debe iniciar la acción de saldar la deuda"}
                            >
                                {isDebtor ? 'Saldar Deuda' : 'Pendiente'}
                            </button>
                        </li>
                    )
                })}
            </ul>
        )}
    </div>
);

const DebtManager: React.FC<DebtManagerProps> = ({ debts, currentUserId, onSettleDebt }) => {
    const debtsOwedToMe = debts.filter(d => d.creditorId === currentUserId);
    const debtsIOwe = debts.filter(d => d.debtorId === currentUserId);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DebtCard title="Días que me deben" debts={debtsOwedToMe} perspective="creditor" onSettleDebt={onSettleDebt} />
            <DebtCard title="Días que debo" debts={debtsIOwe} perspective="debtor" onSettleDebt={onSettleDebt} />
        </div>
    );
};

export default DebtManager;