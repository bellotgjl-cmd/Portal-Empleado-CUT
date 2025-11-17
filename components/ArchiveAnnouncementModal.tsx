import React, { useState } from 'react';
import type { Announcement } from '../types';

type ArchiveReason = 'success' | 'no_reason';

interface ArchiveAnnouncementModalProps {
  announcement: Announcement;
  onClose: () => void;
  onArchive: (announcementId: string, reason: ArchiveReason) => void;
}

const ArchiveAnnouncementModal: React.FC<ArchiveAnnouncementModalProps> = ({ announcement, onClose, onArchive }) => {
  const [reason, setReason] = useState<ArchiveReason>('success');

  const handleSubmit = () => {
    onArchive(announcement.id, reason);
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
        onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h3 className="text-2xl font-bold text-gray-800">Archivar Anuncio</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="space-y-4">
            <p className="text-gray-700">Vas a archivar el anuncio: <strong className="text-indigo-600">"{announcement.title}"</strong>.</p>
            <p className="text-gray-700">Una vez archivado, ya no será visible en la lista de anuncios activos. Por favor, selecciona el motivo:</p>
            
            <fieldset className="space-y-2">
                <legend className="sr-only">Motivo de archivado</legend>
                <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${reason === 'success' ? 'bg-indigo-50 border-indigo-400' : 'hover:bg-gray-50'}`}>
                    <input type="radio" name="archiveReason" value="success" checked={reason === 'success'} onChange={() => setReason('success')} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"/>
                    <span className="ml-3 font-semibold text-gray-800">El anuncio tuvo éxito</span>
                </label>
                 <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${reason === 'no_reason' ? 'bg-indigo-50 border-indigo-400' : 'hover:bg-gray-50'}`}>
                    <input type="radio" name="archiveReason" value="no_reason" checked={reason === 'no_reason'} onChange={() => setReason('no_reason')} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"/>
                    <span className="ml-3 font-semibold text-gray-800">Archivar sin motivo específico</span>
                </label>
            </fieldset>
        </div>
        
        <div className="mt-6 pt-6 border-t flex justify-end gap-3">
             <button 
                onClick={onClose} 
                className="bg-gray-200 text-gray-800 font-bold py-2 px-5 rounded-lg hover:bg-gray-300 transition-colors"
            >
                Cancelar
            </button>
             <button 
                onClick={handleSubmit} 
                className="bg-indigo-600 text-white font-bold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
                Confirmar Archivo
            </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveAnnouncementModal;