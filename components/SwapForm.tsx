
import * as React from 'react';
import FortnightSelector from './FortnightSelector';
import type { FortnightId, SwapRequest } from '../types';
import { getFortnightLabel, FORTNIGHTS, getFullMonthId, groupFortnights, expandFortnightIds, isFullMonthId } from '../constants';

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
  
  // Track which months the user has chosen to "Force as Full Month"
  const [forceFullMonth, setForceFullMonth] = React.useState<Record<string, boolean>>({});

  const isContactInfoLocked = !!initialData?.employeeName;

  React.useEffect(() => {
    if (initialData) {
      setEmployeeName(initialData.employeeName);
      setEmail(initialData.email);
      setWhatsapp(initialData.whatsapp);
      
      // Validate holdings against what they actually own
      // Note: initialData.has might contain 'aug-full', while currentHoldings has 'aug-1', 'aug-2'.
      // We need to be smart about this validation.
      const expandedInitialHas = expandFortnightIds(initialData.has);
      const validHas = initialData.has.filter(h => {
          if (isFullMonthId(h)) {
              // If it's a full month ID, check if we own both parts
              const parts = expandFortnightIds([h]);
              return parts.every(p => currentHoldings.includes(p));
          }
          return currentHoldings.includes(h);
      });
      setHas(validHas);

      // Rehydrate the 'forceFullMonth' state based on initialData
      const initialForceState: Record<string, boolean> = {};
      validHas.forEach(h => {
          if (isFullMonthId(h)) {
              const month = h.split('-')[0];
              initialForceState[month] = true;
          }
      });
      setForceFullMonth(initialForceState);
      
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
      setForceFullMonth({});
    }
  }, [initialData, currentHoldings]);

  const toggleHas = (id: FortnightId) => {
    setHas(prev => {
        const isAdding = !prev.includes(id);
        if (isAdding) {
            return [...prev, id];
        } else {
            return prev.filter(fid => fid !== id);
        }
    });
  };

  const handleForceMonthToggle = (month: string, isChecked: boolean) => {
      const mKey = month.toLowerCase();
      setForceFullMonth(prev => ({ ...prev, [mKey]: isChecked }));
      
      const fullId = getFullMonthId(month);
      const partIds = FORTNIGHTS.filter(f => f.month === month).map(f => f.id);

      if (isChecked) {
          // Switch from parts to full: Remove parts, keep 'full' if they were selected, or just clean up.
          // Actually, usually when switching mode, we clear selection to avoid confusion, 
          // OR we auto-select full if both parts were selected.
          // Let's reset selection for this month to be safe/clear.
          setHas(prev => prev.filter(id => !partIds.includes(id))); 
      } else {
          // Switch from full to parts: Remove full ID.
          setHas(prev => prev.filter(id => id !== fullId));
      }
  };

  const toggleWants = (idOrIds: FortnightId | FortnightId[]) => {
     // Handle single or multiple IDs
     const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
     
     // Filter out any IDs that are already in 'currentHoldings' (users shouldn't want what they have)
     const validIds = ids.filter(id => !currentHoldings.includes(id));
     
     setWants(prev => {
         const newSet = new Set(prev);
         
         // Simple toggle logic: If passed IDs are in set, remove. If not, add.
         const allPresent = validIds.every(id => newSet.has(id));
         
         if (allPresent) {
             validIds.forEach(id => newSet.delete(id));
         } else {
             validIds.forEach(id => newSet.add(id));
         }
         
         return Array.from(newSet);
     });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Re-validate ownership at submission time
    // Expand 'has' (which might contain full-ids) to check against currentHoldings (which only has parts)
    const expandedHas = expandFortnightIds(has);
    const invalidHoldings = expandedHas.filter(h => !currentHoldings.includes(h));
    
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
       setForceFullMonth({});
    }
  };

  const renderOfferButton = (id: string) => {
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
      );
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
             <div className="space-y-4">
                 {(() => {
                     const { fullMonths, singles } = groupFortnights(currentHoldings);
                     return (
                         <>
                            {fullMonths.map((group, i) => {
                                const monthName = group[0].split('-')[0]; // e.g. 'agosto'
                                const fullMonthId = getFullMonthId(monthName);
                                const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                                const isForced = !!forceFullMonth[monthName];

                                return (
                                    <div key={i} className="bg-green-50 p-3 rounded-lg border border-green-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-green-200">
                                            <p className="text-sm font-bold text-green-800">{capitalizedMonth} (Mes Completo)</p>
                                            <label className="flex items-center space-x-2 cursor-pointer select-none">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isForced} 
                                                    onChange={(e) => handleForceMonthToggle(monthName, e.target.checked)}
                                                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                                />
                                                <span className="text-xs text-gray-600">Obligar cambio por mes</span>
                                            </label>
                                        </div>
                                        
                                        {isForced ? (
                                            <div className="grid grid-cols-1 gap-2">
                                                {renderOfferButton(fullMonthId)}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2">
                                                {group.map(id => renderOfferButton(id))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            
                            {singles.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase">Quincenas Sueltas</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {singles.map(id => renderOfferButton(id))}
                                    </div>
                                </div>
                            )}
                         </>
                     );
                 })()}
             </div>
          )}
          <p className="mt-4 text-xs text-gray-500">
              * Si seleccionas "Obligar cambio por mes", ofrecerás las dos quincenas como un bloque indivisible.
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
