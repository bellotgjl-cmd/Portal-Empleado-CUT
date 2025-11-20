
import * as React from 'react';
import type { Match, Transaction, TradeProposal } from '../types';
import { getFortnightLabel } from '../constants';
import CountdownTimer from './CountdownTimer';

interface MatchListProps {
  matches: Match[];
  currentUserRequestId: string | null;
  activeTransaction: Transaction | null;
  onSelectMatch: (match: Match, proposal: TradeProposal) => void;
  onAccept: (transactionId: string) => void;
  onReject: (transactionId: string) => void;
  onExpire: (transactionId: string) => void;
}


const FortnightPill: React.FC<{ id: string, color: string }> = ({ id, color }) => (
    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full text-white ${color}`}>
        {getFortnightLabel(id)}
    </span>
);

const ContactIcons: React.FC<{ 
    match: Match;
    activeTransactionForThisMatch: Transaction | null;
    currentUserRequestId: string | null;
}> = ({ match, activeTransactionForThisMatch, currentUserRequestId }) => {
    const { otherPerson } = match;
    const { email, whatsapp, employeeName } = otherPerson;

    let subject: string;
    let mailBody: string;
    let whatsappText: string;

    if (activeTransactionForThisMatch && currentUserRequestId) {
        // Specific message for an active transaction
        const isInitiator = activeTransactionForThisMatch.initiatorId === currentUserRequestId;
        
        const myGive = isInitiator ? activeTransactionForThisMatch.initiatorGives[0] : activeTransactionForThisMatch.receiverGives[0];
        const myGet = isInitiator ? activeTransactionForThisMatch.receiverGives[0] : activeTransactionForThisMatch.initiatorGives[0];

        const myGiveLabel = getFortnightLabel(myGive);
        const myGetLabel = getFortnightLabel(myGet);

        if (isInitiator) {
            subject = `Propuesta de intercambio: ${myGiveLabel} por ${myGetLabel}`;
            mailBody = `Hola ${employeeName},\n\nTe contacto sobre nuestro posible intercambio. Tengo "${myGiveLabel}" que buscas, y tú tienes "${myGetLabel}" que yo busco.\n\nTe he enviado la propuesta a través de la aplicación para que la confirmes.\n\n¡Gracias!`;
            whatsappText = `Hola ${employeeName}, te contacto sobre nuestro posible intercambio. Tengo "${myGiveLabel}" que buscas, y tú tienes "${myGetLabel}" que yo busco. Te he enviado la propuesta a través de la aplicación para que la confirmes. ¡Gracias!`;
        } else { // Current user is the receiver
            subject = `Sobre tu propuesta de intercambio: ${myGetLabel} por ${myGiveLabel}`;
            mailBody = `Hola ${employeeName},\n\nHe recibido tu propuesta para intercambiar tu "${myGetLabel}" por mi "${myGiveLabel}".\n\nQuería contactar contigo para hablar sobre ello.\n\nUn saludo.`;
            whatsappText = `Hola ${employeeName}, he recibido tu propuesta para intercambiar tu "${myGetLabel}" por mi "${myGiveLabel}". Quería contactar contigo para hablar sobre ello. Un saludo.`;
        }
    } else {
        // Generic message for a potential match
        const hasLabels = otherPerson.has.map(getFortnightLabel).join(', ');
        const wantsLabels = otherPerson.wants.map(getFortnightLabel).join(', ');

        subject = "Interesado/a en tu intercambio de vacaciones";
        mailBody = `Hola ${employeeName},\n\nHe visto tu solicitud para intercambiar quincenas de vacaciones y creo que podríamos tener una coincidencia.\n\nTú tienes "${hasLabels}" y buscas "${wantsLabels}".\n\n¿Hablamos para ver si podemos llegar a un acuerdo?\n\nUn saludo.`;
        whatsappText = `Hola ${employeeName}, he visto que podríamos tener una coincidencia para intercambiar vacaciones. Tienes "${hasLabels}" y buscas "${wantsLabels}". ¿Hablamos? Un saludo.`;
    }
    
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;
    const whatsappLink = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappText)}`;

    return (
        <div className="flex items-center space-x-3">
            <a href={mailtoLink} target="_blank" rel="noopener noreferrer" title={`Enviar email a ${email}`} className="text-gray-400 hover:text-teal-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" title={`Contactar por WhatsApp`} className="text-gray-400 hover:text-green-500 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24" fill="currentColor">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.35 3.45 16.86L2.05 22L7.31 20.62C8.75 21.41 10.36 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 9.28 20.94 6.81 19.1 4.97C17.26 3.13 14.79 2.12 12.16 2.12L12.04 2ZM12.04 3.67C14.25 3.67 16.31 4.5 17.87 6.05C19.42 7.61 20.28 9.67 20.28 11.88C20.28 16.45 16.63 20.1 12.04 20.1C10.5 20.1 9 19.64 7.74 18.86L7.33 18.61L4.43 19.43L5.27 16.61L5.02 16.19C4.16 14.86 3.78 13.33 3.78 11.88C3.78 7.31 7.43 3.67 12.04 3.67ZM9.11 7.23C8.89 7.23 8.7 7.22 8.51 7.22C8.2 7.22 7.88 7.31 7.69 7.62C7.5 7.93 6.87 8.54 6.87 9.71C6.87 10.88 7.71 11.99 7.85 12.17C8 12.35 9.08 14.03 10.8 14.8C12.21 15.44 12.56 15.58 13.04 15.77C13.78 16.06 14.36 16.02 14.78 15.65C15.28 15.21 15.71 14.54 15.89 14.23C16.08 13.92 16.17 13.74 16.12 13.56C16.08 13.38 15.89 13.29 15.65 13.17C15.42 13.06 14.25 12.49 14.02 12.4C13.78 12.31 13.6 12.26 13.41 12.57C13.22 12.88 12.72 13.45 12.58 13.61C12.43 13.77 12.29 13.79 12.04 13.68C11.8 13.58 11.07 13.34 10.16 12.54C9.44 11.91 8.94 11.13 8.8 10.92C8.65 10.71 8.78 10.58 8.91 10.45C9.02 10.33 9.16 10.15 9.3 10C9.44 9.85 9.49 9.73 9.58 9.54C9.67 9.35 9.62 9.18 9.55 9.07C9.49 8.96 9.11 8.05 8.94 7.62C8.77 7.18 8.6 7.23 8.44 7.23H8.43L8.24 7.23H9.11Z" /></svg>
            </a>
        </div>
    );
};

const MatchCard: React.FC<{
    match: Match;
    isLocked: boolean;
    isThisTheActiveMatch: boolean;
    activeTransaction: Transaction | null;
    currentUserRequestId: string | null;
    onSelectMatch: (match: Match, proposal: TradeProposal) => void;
    onAccept: (transactionId: string) => void;
    onReject: (transactionId: string) => void;
    onExpire: (transactionId: string) => void;
}> = ({ match, isLocked, isThisTheActiveMatch, activeTransaction, currentUserRequestId, onSelectMatch, onAccept, onReject, onExpire }) => {
    
    const [selectedProposal, setSelectedProposal] = React.useState<TradeProposal | null>(null);

    const cardBaseClasses = "p-5 rounded-xl shadow-lg transition-all duration-300";
    let cardStateClasses = 'bg-white border border-gray-200';
    
    if (isLocked) {
        if (isThisTheActiveMatch) {
            cardStateClasses = 'bg-teal-50 border-2 border-teal-500 ring-4 ring-teal-500/20';
        } else {
            cardStateClasses = 'bg-gray-100 border border-gray-200 opacity-50 cursor-not-allowed';
        }
    } else {
        cardStateClasses = 'bg-white border-2 border-transparent hover:shadow-xl hover:border-teal-400';
    }

    const isInitiator = activeTransaction?.initiatorId === currentUserRequestId;
    const isReceiver = activeTransaction?.receiverId === currentUserRequestId;

    const proposalsToShow = (isReceiver && isThisTheActiveMatch && activeTransaction)
        ? match.proposals.filter(p => 
            p.give === activeTransaction.receiverGives[0] && 
            p.get === activeTransaction.initiatorGives[0]
          )
        : match.proposals;

    const handleSelectClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedProposal) {
            onSelectMatch(match, selectedProposal);
        }
    };

    return (
        <div 
            id={`match-card-${match.otherPerson.id}`}
            key={match.otherPerson.id} 
            className={`${cardBaseClasses} ${cardStateClasses}`}
        >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                <span className="text-2xl">🎉</span>
                <h4 className="font-bold text-lg text-gray-800">¡Coincidencia con {match.otherPerson.employeeName}!</h4>
              </div>
              <ContactIcons 
                match={match} 
                activeTransactionForThisMatch={isThisTheActiveMatch ? activeTransaction : null}
                currentUserRequestId={currentUserRequestId}
              />
            </div>

            <div className="mt-4 border-t pt-4 space-y-4">
                <h5 className="font-semibold text-gray-800">
                    {isReceiver && isThisTheActiveMatch ? 'Propuesta Recibida:' : 'Propuestas de Intercambio:'}
                </h5>
                <div className="space-y-2">
                    {proposalsToShow.map((proposal) => {
                        const originalIndex = match.proposals.findIndex(p => p.give === proposal.give && p.get === proposal.get);
                        const proposalId = `${match.otherPerson.id}-proposal-${originalIndex}`;
                        
                        let isThisTheActiveProposal = false;
                        if (isThisTheActiveMatch && activeTransaction) {
                            if (isInitiator) {
                                isThisTheActiveProposal = activeTransaction.initiatorGives[0] === proposal.give && activeTransaction.receiverGives[0] === proposal.get;
                            } else if (isReceiver) {
                                isThisTheActiveProposal = activeTransaction.receiverGives[0] === proposal.give && activeTransaction.initiatorGives[0] === proposal.get;
                            }
                        }

                        const isDisabled = isLocked && !isThisTheActiveProposal;

                        return (
                            <label 
                                htmlFor={proposalId} 
                                key={proposalId}
                                className={`flex items-center p-3 rounded-lg border-2 transition-all ${isReceiver && isThisTheActiveMatch ? 'cursor-default' : 'cursor-pointer'} ${
                                    isThisTheActiveProposal ? 'bg-green-100 border-green-400' :
                                    selectedProposal === proposal ? 'bg-teal-100 border-teal-400' : 
                                    isDisabled ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-gray-50 border-gray-200 hover:bg-teal-50 hover:border-teal-300'
                                }`}
                            >
                                <input
                                    type="radio"
                                    id={proposalId}
                                    name={`proposal-${match.otherPerson.id}`}
                                    value={originalIndex}
                                    checked={selectedProposal === proposal || isThisTheActiveProposal}
                                    onClick={() => setSelectedProposal(selectedProposal === proposal ? null : proposal)}
                                    readOnly
                                    disabled={isDisabled || (isReceiver && isThisTheActiveMatch)}
                                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 mr-3"
                                />
                                <div className="flex-grow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Tú entregas:</span>
                                        <FortnightPill id={proposal.give} color="bg-blue-500" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Recibes:</span>
                                        <FortnightPill id={proposal.get} color="bg-green-500" />
                                    </div>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>

            {isLocked && isThisTheActiveMatch && activeTransaction && (
              <div className="mt-4 pt-4 border-t border-teal-200">
                {isInitiator && (
                  <div className="text-center p-3 bg-teal-100 rounded-lg">
                    <p className="font-semibold text-teal-800">¡Selección enviada!</p>
                    <p className="text-sm text-teal-700">Esperando respuesta de {match.otherPerson.employeeName}.</p>
                    <div className="mt-2">
                      <CountdownTimer 
                        expiryTimestamp={activeTransaction.timestamp + 3600 * 1000} 
                        onExpire={() => onExpire(activeTransaction.id)}
                      />
                    </div>
                  </div>
                )}
                {isReceiver && (
                  <div className="text-center p-3 bg-green-100 rounded-lg">
                    <p className="font-semibold text-green-800">{match.otherPerson.employeeName} te ha seleccionado para este intercambio.</p>
                     <div className="my-2">
                      <CountdownTimer 
                        expiryTimestamp={activeTransaction.timestamp + 3600 * 1000}
                        onExpire={() => onExpire(activeTransaction.id)}
                      />
                    </div>
                    <div className="flex justify-center gap-4 mt-2">
                       <button onClick={() => onAccept(activeTransaction.id)} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-green-700">Aceptar</button>
                       <button onClick={() => onReject(activeTransaction.id)} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-red-700">Rechazar</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {!isLocked && (
                 <div className="mt-4 pt-4 border-t">
                     <button 
                        onClick={handleSelectClick}
                        disabled={!selectedProposal}
                        className="w-full bg-teal-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-teal-700 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                     >
                         Seleccionar este intercambio
                     </button>
                 </div>
            )}
        </div>
    );
};


const MatchList: React.FC<MatchListProps> = ({ matches, currentUserRequestId, activeTransaction, onSelectMatch, onAccept, onReject, onExpire }) => {
  if (matches.length === 0) {
    return (
      <div className="text-center py-10 px-6 bg-white rounded-xl shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-500">Sin coincidencias por ahora.</h3>
        <p className="mt-1 text-sm text-gray-400">Cuando alguien quiera lo que tú tienes, y tenga lo que tú quieres, aparecerá aquí.</p>
      </div>
    );
  }

  const isLocked = !!activeTransaction;

  return (
    <div className="space-y-4">
      {isLocked && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md mb-4" role="alert">
              <p className="font-bold">Acción pendiente</p>
              <p className="text-sm">Tienes una selección en curso. Debes esperar a que se resuelva para poder seleccionar otra coincidencia.</p>
          </div>
      )}
      {matches.map(match => {
        const isThisTheActiveMatch = activeTransaction && 
            (match.otherPerson.id === activeTransaction.receiverId || match.otherPerson.id === activeTransaction.initiatorId);

        return (
            <MatchCard
                key={match.otherPerson.id}
                match={match}
                isLocked={isLocked}
                isThisTheActiveMatch={!!isThisTheActiveMatch}
                activeTransaction={activeTransaction}
                currentUserRequestId={currentUserRequestId}
                onSelectMatch={onSelectMatch}
                onAccept={onAccept}
                onReject={onReject}
                onExpire={onExpire}
            />
        )
      })}
    </div>
  );
};

export default MatchList;
