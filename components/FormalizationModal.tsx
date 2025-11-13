import React, { useRef, useState } from 'react';
import type { Transaction, SwapRequest } from '../types';
import { getFortnightLabel } from '../constants';

interface FormalizationModalProps {
  transaction: Transaction;
  initiator: SwapRequest;
  receiver: SwapRequest;
  onClose: () => void;
}

const FormalizationModal: React.FC<FormalizationModalProps> = ({ transaction, initiator, receiver, onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [copyButtonText, setCopyButtonText] = useState('Copiar al Portapapeles');

  const initiatorGives = transaction.initiatorGives.map(getFortnightLabel).join(', ');
  const receiverGives = transaction.receiverGives.map(getFortnightLabel).join(', ');

  const formalText = `
    Asunto: SOLICITUD DE FORMALIZACIÓN DE CAMBIO DE VACACIONES

    A la atención del Departamento de Planificación,

    Por medio de la presente, los abajo firmantes:

    - D./Dña. ${initiator.employeeName}, con número de empleado ${initiator.employeeId}.
    - D./Dña. ${receiver.employeeName}, con número de empleado ${receiver.employeeId}.

    Comunicamos que, habiendo alcanzado un acuerdo mutuo, solicitamos la formalización del siguiente cambio en nuestros periodos vacacionales asignados:

    Asignación Original:
    - D./Dña. ${initiator.employeeName} cedía el periodo de: ${initiatorGives}.
    - D./Dña. ${receiver.employeeName} cedía el periodo de: ${receiverGives}.

    Nueva Asignación Acordada:
    Tras el intercambio, los periodos vacacionales quedarán de la siguiente manera:
    - D./Dña. ${initiator.employeeName} pasará a disfrutar del periodo de: ${receiverGives}.
    - D./Dña. ${receiver.employeeName} pasará a disfrutar del periodo de: ${initiatorGives}.

    Agradecemos de antemano su colaboración para hacer efectivo este cambio en la planificación.

    Atentamente,

    Fecha: ${new Date().toLocaleDateString('es-ES')}

    Fdo: ${initiator.employeeName}

    Fdo: ${receiver.employeeName}
  `;

  const handleCopy = () => {
    if (contentRef.current) {
      navigator.clipboard.writeText(contentRef.current.innerText)
        .then(() => {
          setCopyButtonText('¡Copiado!');
          setTimeout(() => setCopyButtonText('Copiar al Portapapeles'), 2000);
        })
        .catch(err => {
          console.error('Error al copiar: ', err);
          alert('No se pudo copiar el texto.');
        });
    }
  };

  return (
    <>
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl m-4 max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 className="text-2xl font-bold text-gray-800">Formulario de Cambio Oficial</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto flex-grow pr-4 -mr-4">
                    <div ref={contentRef} className="bg-gray-50 p-6 rounded-lg border prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap font-serif">
                        {formalText.trim()}
                    </div>
                </div>
                
                <div className="mt-6 pt-6 border-t flex flex-col sm:flex-row justify-end gap-3">
                    <button 
                        onClick={handleCopy}
                        className="bg-indigo-600 text-white font-bold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 transition-colors w-full sm:w-auto"
                    >
                        {copyButtonText}
                    </button>
                </div>
            </div>
        </div>
    </>
  );
};

export default FormalizationModal;