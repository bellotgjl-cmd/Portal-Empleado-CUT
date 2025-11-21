
import * as React from 'react';
import FortnightSelector from './FortnightSelector';
import type { FortnightId, SwapRequest } from '../types';
import { getFortnightLabel, FORTNIGHTS, getFullMonthId } from '../constants';

interface SwapFormProps {
  onSubmit: (request: Pick<SwapRequest, 'has' | 'wants'>) => void;
  initialData?: SwapRequest | null;
  currentHoldings: FortnightId[]; // NEW: Only show what the user actually owns
}

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg h-full">
    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{title}</h3>
    {children}
  </div>
);

const SwapForm: React.FC<SwapFormProps> = ({ onSubmit, initialData, currentHoldings }) => {
  const [employeeName, setEmployeeName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [whatsapp, setWhatsapp] = React.useState('');
  const [has, setHas] = React.useState<FortnightId[]>([]);
  const [wants, setWants] = React.useState<FortnightId[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const isContactInfoLocked = !!initialData?.employeeName;

  React.useEffect(() => {
    if (initialData) {
      setEmployeeName(initialData.employeeName);
      setEmail(initialData.email);
      setWhatsapp(initialData.whatsapp);
      // Ensure we only pre-fill 'has' if the user still owns them
      const validHas = initialData.has.filter(h => currentHoldings.includes(h));
      setHas(validHas);
      
      // Filter wants to ensure no overlap with what is owned (currentHoldings)
      const filteredWants = initialData.wants.filter(w => {
          if (currentHoldings.includes(w)) return false;
          
          // Check for full month conflicts if we have parts of that month
          if (w.endsWith('-full')) {
             const month = w.split('-')[0];
             const hasPart = currentHoldings.some(h => h.startsWith(month + '-'));
             if (hasPart) return false;
          }
          return true;
      });
      setWants(filteredWants);
    } else {
      setEmployeeName('');
      setEmail('');
      setWhatsapp('');
      setHas([]);
      setWants([]);
    }
  }, [initialData, currentHoldings]);

  const toggleHas = (id: FortnightId) => {
    // Strict check: Can only toggle if it's in currentHoldings
    if (!currentHoldings.includes(id)) return;
    
    setHas(prev => {
        const isAdding = !prev.includes(id);
        if (isAdding) {
            return [...prev, id];
        } else {
            return prev.filter(fid => fid !== id);
        }
    });
  };

  const toggleWants = (id: FortnightId) => {
     // Prevent selecting if it's already in 'currentHoldings'
     if (currentHoldings.includes(id)) return;
     setWants(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Re-validate ownership at submission time
    const invalidHoldings = has.filter(h => !currentHoldings.includes(h));
    if (invalidHoldings.length > 0) {
         setError(`Error: Ya no posees las siguientes quincenas seleccionadas: ${invalidHoldings.map(getFortnightLabel).join(', ')}`);
         return;
    }

    if (isContactInfoLocked) {
        if (has.length === 0 || wants.length === 0) {
            setError('Debes seleccionar al menos una quincena en "Tengo" y "Quiero".');
            return;
        }
    }
    
    setError(null);
    onSubmit({ has, wants });
    
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" value={employeeName} readOnly className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed text-gray-800" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={email} readOnly className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed text-gray-800" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input type="tel" value={whatsapp} readOnly className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed text-gray-800" />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="¿Qué ofreces? (Solo lo que posees)">
          {currentHoldings.length === 0 ? (
              <p className="text-red-500 italic text-center p-4 bg-red-50 rounded">No tienes quincenas disponibles para intercambiar actualmente.</p>
          ) : (
             <div className="grid grid-cols-2 gap-2">
                 {currentHoldings.map(id => {
                     const isSelected = has.includes(id);
                     return (
                         <button
                            key={id}
                            type="button"
                            onClick={() => toggleHas(id)}
                            className={`p-2 rounded-lg border text-sm transition-colors ${isSelected ? 'bg-green-600 text-white border-green-700 shadow-md' : 'bg-white hover:bg-green-50 border-gray-300 text-gray-700'}`}
                         >
                             {getFortnightLabel(id)}
                         </button>
                     )
                 })}
             </div>
          )}
          <p className="mt-4 text-xs text-gray-500">
              * Solo se muestran las quincenas que tienes asignadas y disponibles.
          </p>
        </Card>
        
        <Card title="¿Qué buscas? (Sin límite)">
          <FortnightSelector selected={wants} onToggle={toggleWants} disabledIds={currentHoldings} />
        </Card>
      </div>

      {error && <p className="text-red-500 text-center text-sm bg-red-100 p-3 rounded-lg border border-red-200">{error}</p>}
      
      <button 
        type="submit" 
        disabled={has.length === 0 || wants.length === 0}
        className="w-full bg-teal-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
      >
        {initialData?.id ? 'Actualizar Intercambio' : 'Publicar Intercambio'}
      </button>
    </form>
  );
};

export default SwapForm;
