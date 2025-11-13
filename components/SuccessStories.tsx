

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Transaction, SwapRequest } from '../types';
import { getFortnightLabel } from '../constants';
import FormalizationModal from './FormalizationModal';

interface SuccessStoriesProps {
  transactions: Transaction[];
  allRequests: SwapRequest[];
  currentUserRequestId: string | null;
  highlightedTransactionId?: string | null;
}

const FortnightPill: React.FC<{ id: string, color: string }> = ({ id, color }) => (
    <span className={`inline-block px-3 py-1 text-xs font-semibold text-white rounded-full ${color}`}>
        {getFortnightLabel(id)}
    </span>
);

const SuccessStories: React.FC<SuccessStoriesProps> = ({ transactions, allRequests, currentUserRequestId, highlightedTransactionId }) => {
  const [formalizingTransaction, setFormalizingTransaction] = useState<Transaction | null>(null);
  const [initiatorForModal, setInitiatorForModal] = useState<SwapRequest | null>(null);
  const [receiverForModal, setReceiverForModal] = useState<SwapRequest | null>(null);
  const highlightedRef = useRef<HTMLDivElement>(null);

  const { userSuccesses, otherSuccesses } = useMemo(() => {
    const confirmed = transactions.filter(t => t.status === 'confirmed');

    let allUserSuccesses = confirmed.filter(t =>
        currentUserRequestId && (t.initiatorId === currentUserRequestId || t.receiverId === currentUserRequestId)
    );
    const allOtherSuccesses = confirmed.filter(t =>
        !currentUserRequestId || (t.initiatorId !== currentUserRequestId && t.receiverId !== currentUserRequestId)
    );

    allUserSuccesses.sort((a, b) => b.timestamp - a.timestamp);
    allOtherSuccesses.sort((a, b) => b.timestamp - a.timestamp);

    if (highlightedTransactionId) {
      const highlightedTxIndex = allUserSuccesses.findIndex(t => t.id === highlightedTransactionId);
      if (highlightedTxIndex > -1) {
        const [highlightedTx] = allUserSuccesses.splice(highlightedTxIndex, 1);
        allUserSuccesses.unshift(highlightedTx);
      }
    }
    
    return { userSuccesses: allUserSuccesses, otherSuccesses: allOtherSuccesses };
  }, [transactions, currentUserRequestId, highlightedTransactionId]);

  useEffect(() => {
    if (highlightedTransactionId && highlightedRef.current) {
      setTimeout(() => {
        highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [highlightedTransactionId]);


  if (userSuccesses.length === 0 && otherSuccesses.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.97l-1.9 3.8a2 2 0 00.383 2.513l2.48 2.48A2 2 0 0014 10z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-600">Aún no hay intercambios exitosos.</h3>
        <p className="mt-1 text-sm text-gray-400">Cuando se confirme un intercambio, aparecerá aquí como un caso de éxito.</p>
      </div>
    );
  }

  const findRequestById = (id: string | null) => {
    if (!id) return null;
    return allRequests.find(r => r.id === id);
  };
  
  const currentUser = findRequestById(currentUserRequestId);

  const handleFormalizeClick = (t: Transaction, initiator: SwapRequest, receiver: SwapRequest) => {
    setInitiatorForModal(initiator);
    setReceiverForModal(receiver);
    setFormalizingTransaction(t);
  };

  const renderStoryCard = (t: Transaction, isCurrentUserInvolved: boolean) => {
      const initiator = findRequestById(t.initiatorId);
      const receiver = findRequestById(t.receiverId);

      if (!initiator || !receiver) {
        return null;
      }
      
      const otherPerson = isCurrentUserInvolved ? (initiator.id === currentUserRequestId ? receiver : initiator) : null;
      const isHighlighted = t.id === highlightedTransactionId;

      let mailtoLink = '';
      let whatsappLink = '';

      if (isCurrentUserInvolved && currentUser && otherPerson) {
          const isInitiatorCurrentUser = t.initiatorId === currentUser.id;
          const myGiveLabel = getFortnightLabel(isInitiatorCurrentUser ? t.initiatorGives[0] : t.receiverGives[0]);
          const otherPersonGaveLabel = getFortnightLabel(isInitiatorCurrentUser ? t.receiverGives[0] : t.initiatorGives[0]);

          const subject = "Confirmación de nuestro intercambio de vacaciones";
          const body = `Hola ${otherPerson.employeeName},\n\nTe contacto para confirmar que nuestro intercambio de "${myGiveLabel}" por "${otherPersonGaveLabel}" se ha completado con éxito en la aplicación.\n\nNos resta firmar y formalizar de forma oficial el cambio, para lo que deberemos quedar.\n\n¡Muchas gracias por todo y que disfrutes de tus vacaciones!\n\nUn saludo,\n${currentUser.employeeName}`;
          const whatsappText = `Hola ${otherPerson.employeeName}, te contacto para confirmar que nuestro intercambio de "${myGiveLabel}" por "${otherPersonGaveLabel}" se ha completado con éxito en la aplicación. Nos resta firmar y formalizar de forma oficial el cambio, para lo que deberemos quedar. ¡Gracias y que disfrutes de tus vacaciones!`;
          
          mailtoLink = `mailto:${otherPerson.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          whatsappLink = `https://wa.me/${otherPerson.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappText)}`;
      }

      return (
            <div 
              key={t.id}
              ref={isHighlighted ? highlightedRef : null}
              className={`bg-white p-6 rounded-xl shadow-lg border transition-all duration-500 ${isHighlighted ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-green-200'}`}>
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div className="flex items-center space-x-4">
                      <span className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a3.001 3.001 0 015.658 0M12 6V3m0 3V6m0 3v6m0-9a3 3 0 100-6 3 3 0 000 6z" />
                          </svg>
                      </span>
                      <div>
                          <h4 className="font-bold text-xl text-gray-800">¡Intercambio Exitoso!</h4>
                          <p className="text-sm text-gray-500">
                              Confirmado el {new Date(t.timestamp).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                      </div>
                  </div>
                  {isCurrentUserInvolved && otherPerson && (
                      <div className="flex items-center space-x-3">
                          <a href={mailtoLink} target="_blank" rel="noopener noreferrer" title={`Enviar email a ${otherPerson.email}`} className="text-gray-400 hover:text-indigo-600 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                          </a>
                          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" title={`Contactar por WhatsApp a ${otherPerson.employeeName}`} className="text-gray-400 hover:text-green-500 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24" fill="currentColor">
                                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.35 3.45 16.86L2.05 22L7.31 20.62C8.75 21.41 10.36 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 9.28 20.94 6.81 19.1 4.97C17.26 3.13 14.79 2.12 12.16 2.12L12.04 2ZM12.04 3.67C14.25 3.67 16.31 4.5 17.87 6.05C19.42 7.61 20.28 9.67 20.28 11.88C20.28 16.45 16.63 20.1 12.04 20.1C10.5 20.1 9 19.64 7.74 18.86L7.33 18.61L4.43 19.43L5.27 16.61L5.02 16.19C4.16 14.86 3.78 13.33 3.78 11.88C3.78 7.31 7.43 3.67 12.04 3.67ZM9.11 7.23C8.89 7.23 8.7 7.22 8.51 7.22C8.2 7.22 7.88 7.31 7.69 7.62C7.5 7.93 6.87 8.54 6.87 9.71C6.87 10.88 7.71 11.99 7.85 12.17C8 12.35 9.08 14.03 10.8 14.8C12.21 15.44 12.56 15.58 13.04 15.77C13.78 16.06 14.36 16.02 14.78 15.65C15.28 15.21 15.71 14.54 15.89 14.23C16.08 13.92 16.17 13.74 16.12 13.56C16.08 13.38 15.89 13.29 15.65 13.17C15.42 13.06 14.25 12.49 14.02 12.4C13.78 12.31 13.6 12.26 13.41 12.57C13.22 12.88 12.72 13.45 12.58 13.61C12.43 13.77 12.29 13.79 12.04 13.68C11.8 13.58 11.07 13.34 10.16 12.54C9.44 11.91 8.94 11.13 8.8 10.92C8.65 10.71 8.78 10.58 8.91 10.45C9.02 10.33 9.16 10.15 9.3 10C9.44 9.85 9.49 9.73 9.58 9.54C9.67 9.35 9.62 9.18 9.55 9.07C9.49 8.96 9.11 8.05 8.94 7.62C8.77 7.18 8.6 7.23 8.44 7.23H8.43L8.24 7.23H9.11Z"></path>
                              </svg>
                          </a>
                      </div>
                  )}
              </div>
              
              <p className="text-gray-700 text-center mb-4 text-lg">
                  <span className="font-semibold">{initiator.employeeName}</span> y <span className="font-semibold">{receiver.employeeName}</span> han completado un intercambio.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-600 mb-2">{initiator.employeeName} entregó:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                          {t.initiatorGives.map(id => <FortnightPill key={id} id={id} color="bg-blue-500" />)}
                      </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-600 mb-2">{receiver.employeeName} entregó:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                          {t.receiverGives.map(id => <FortnightPill key={id} id={id} color="bg-teal-500" />)}
                      </div>
                  </div>
              </div>

              {isCurrentUserInvolved && (
                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                  <button
                    onClick={() => handleFormalizeClick(t, initiator, receiver)}
                    className="bg-indigo-600 text-white font-bold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block -mt-1 mr-2" fill="none" viewBox="0 0 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Formalizar Cambio Oficial
                  </button>
                </div>
              )}

            </div>
      );
  }

  return (
    <>
      <div className="space-y-6">
        {userSuccesses.length > 0 && (
          <section>
            {(otherSuccesses.length > 0) && (
              <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-indigo-400">
                Mis Casos de Éxito
              </h3>
            )}
            <div className="space-y-6">
              {userSuccesses.map(t => renderStoryCard(t, true))}
            </div>
          </section>
        )}

        {otherSuccesses.length > 0 && (
          <section className="mt-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-300">
              Otros Casos de Éxito
            </h3>
            <div className="space-y-6">
              {otherSuccesses.map(t => renderStoryCard(t, false))}
            </div>
          </section>
        )}
      </div>

      {formalizingTransaction && initiatorForModal && receiverForModal && (
        <FormalizationModal
          transaction={formalizingTransaction}
          initiator={initiatorForModal}
          receiver={receiverForModal}
          onClose={() => setFormalizingTransaction(null)}
        />
      )}
    </>
  );
};

export default SuccessStories;