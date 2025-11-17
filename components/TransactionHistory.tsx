
import * as React from 'react';
import type { Transaction, SwapRequest } from '../types';
import { getFortnightLabel } from '../constants';

interface TransactionHistoryProps {
  transactions: Transaction[];
  currentUserRequestId: string | null;
  allRequests: SwapRequest[];
}

const getStatusInfo = (status: Transaction['status']) => {
    switch (status) {
        case 'confirmed':
            return {
                text: 'Confirmado',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                bgColor: 'bg-green-50',
            };
        case 'rejected':
            return {
                text: 'Rechazado',
                icon: (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                 bgColor: 'bg-red-50',
            };
        case 'expired':
            return {
                text: 'Expirado',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                bgColor: 'bg-yellow-50',
            };
        default:
            return { text: 'Desconocido', icon: null, bgColor: 'bg-gray-50' };
    }
};

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, currentUserRequestId, allRequests }) => {
  if (!currentUserRequestId) {
    return null; 
  }

  const pastTransactions = transactions
    .filter(t => (t.initiatorId === currentUserRequestId || t.receiverId === currentUserRequestId) && t.status !== 'pending')
    .sort((a, b) => b.timestamp - a.timestamp);

  const successes = pastTransactions.filter(t => t.status === 'confirmed').length;
  const failures = pastTransactions.filter(t => t.status === 'rejected' || t.status === 'expired').length;
  const total = pastTransactions.length;
  
  const findRequestById = (id: string) => allRequests.find(r => r.id === id);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-6 border-b pb-4">
            <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{successes}</p>
                <p className="text-sm font-medium text-gray-600 mt-1">Éxitos</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-600">{failures}</p>
                <p className="text-sm font-medium text-gray-600 mt-1">Fracasos</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-3xl font-bold text-gray-700">{total}</p>
                <p className="text-sm font-medium text-gray-600 mt-1">Total Transacciones</p>
            </div>
        </div>

      {pastTransactions.length === 0 ? (
          <div className="text-center py-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No tienes transacciones pasadas.</p>
          </div>
      ) : (
        <ul className="space-y-4">
            {pastTransactions.map(t => {
            const isInitiator = t.initiatorId === currentUserRequestId;
            const otherPersonId = isInitiator ? t.receiverId : t.initiatorId;
            const otherPerson = findRequestById(otherPersonId);
            const statusInfo = getStatusInfo(t.status);
            
            const gave = isInitiator ? t.initiatorGives : t.receiverGives;
            const got = isInitiator ? t.receiverGives : t.initiatorGives;

            return (
                <li key={t.id} className={`p-4 rounded-lg flex items-start space-x-4 border ${statusInfo.bgColor}`}>
                    <div className="flex-shrink-0 pt-1">
                        {statusInfo.icon}
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold text-gray-800">
                            Intercambio con {otherPerson ? otherPerson.employeeName : 'Usuario desconocido'}
                        </p>
                        <p className="text-sm text-gray-500">
                        Estado: <span className="font-bold">{statusInfo.text}</span>
                        {' - '}
                        {new Date(t.timestamp).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <div className="text-xs text-gray-600 mt-2 bg-white/60 p-2 rounded-md">
                            {isInitiator ? 'Propusiste' : 'Te propusieron'} dar{' '}
                            <span className="font-bold text-blue-700">{gave.map(getFortnightLabel).join(', ')}</span> a cambio de{' '}
                            <span className="font-bold text-green-700">{got.map(getFortnightLabel).join(', ')}</span>.
                        </div>
                    </div>
                </li>
            );
            })}
        </ul>
      )}
    </div>
  );
};

export default TransactionHistory;