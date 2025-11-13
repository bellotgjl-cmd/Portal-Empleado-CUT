import React, { useState, useEffect } from 'react';
import FortnightSelector from './FortnightSelector';
import type { FortnightId, SwapRequest } from '../types';

interface SwapFormProps {
  onSubmit: (request: Pick<SwapRequest, 'has' | 'wants'>) => void;
  initialData?: SwapRequest | null;
}

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
    {children}
  </div>
);

const SwapForm: React.FC<SwapFormProps> = ({ onSubmit, initialData }) => {
  const [employeeName, setEmployeeName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [has, setHas] = useState<FortnightId[]>([]);
  const [wants, setWants] = useState<FortnightId[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isContactInfoLocked = !!initialData?.employeeName;

  useEffect(() => {
    if (initialData) {
      setEmployeeName(initialData.employeeName);
      setEmail(initialData.email);
      setWhatsapp(initialData.whatsapp);
      setHas(initialData.has);
      setWants(initialData.wants);
    } else {
      setEmployeeName('');
      setEmail('');
      setWhatsapp('');
      setHas([]);
      setWants([]);
    }
  }, [initialData]);

  const toggleFortnight = (setter: React.Dispatch<React.SetStateAction<FortnightId[]>>) => (id: FortnightId) => {
    setter(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isContactInfoLocked) {
        if (has.length === 0 || wants.length === 0) {
            setError('Debes seleccionar al menos una quincena en "Tengo" y "Quiero".');
            return;
        }
    }
    
    setError(null);
    onSubmit({ has, wants });
    
    // Don't clear form if we are updating
    if (!initialData?.id) {
       setHas([]);
       setWants([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
       <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Tus Datos de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
                </label>
                <input
                type="text"
                id="employeeName"
                value={employeeName}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100 cursor-not-allowed text-gray-800"
                />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
                </label>
                <input
                type="email"
                id="email"
                value={email}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100 cursor-not-allowed text-gray-800"
                />
            </div>
            <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp
                </label>
                <input
                type="tel"
                id="whatsapp"
                value={whatsapp}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100 cursor-not-allowed text-gray-800"
                />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Tengo (Máximo 3)">
          <FortnightSelector selected={has} onToggle={toggleFortnight(setHas)} limit={3} />
        </Card>
        <Card title="Quiero (Sin límite)">
          <FortnightSelector selected={wants} onToggle={toggleFortnight(setWants)} />
        </Card>
      </div>

      {error && <p className="text-red-500 text-center text-sm bg-red-100 p-3 rounded-lg">{error}</p>}
      
      <button 
        type="submit" 
        className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
      >
        {initialData?.id ? 'Actualizar Intercambio' : 'Publicar Intercambio'}
      </button>
    </form>
  );
};

export default SwapForm;