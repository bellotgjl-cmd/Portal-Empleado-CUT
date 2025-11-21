
import * as React from 'react';
import type { FortnightId, SwapRequest, RegisteredUser } from '../types';
import FortnightSelector from './FortnightSelector';
import SwapList from './SwapList';

interface QuickMatchFinderProps {
  allRequests: SwapRequest[];
  currentUserType: 'Conductor' | 'Taller';
  onSimulateUser?: (user: RegisteredUser) => void;
}

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-inner border border-gray-200">
    <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
    {children}
  </div>
);


const QuickMatchFinder: React.FC<QuickMatchFinderProps> = ({ allRequests, currentUserType, onSimulateUser }) => {
  const [have, setHave] = React.useState<FortnightId[]>([]);
  const [want, setWant] = React.useState<FortnightId[]>([]);
  const [results, setResults] = React.useState<SwapRequest[] | null>(null);
  const [searched, setSearched] = React.useState(false);
  const [searchTrigger, setSearchTrigger] = React.useState(0); // To force animation re-render
  const resultsRef = React.useRef<HTMLDivElement>(null);

  const relevantRequests = React.useMemo(() => {
    return allRequests.filter(req => req.employeeType === currentUserType);
  }, [allRequests, currentUserType]);

  const handleToggleHave = (idOrIds: FortnightId | FortnightId[]) => {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];

    setHave(prev => {
        const newSet = new Set(prev);
        const allPresent = ids.every(id => newSet.has(id));
        
        if (allPresent) {
             ids.forEach(id => newSet.delete(id));
        } else {
             ids.forEach(id => newSet.add(id));
        }
        return Array.from(newSet);
    });

    // Logic to remove from 'want' if added to 'have' is tricky with bulk updates, 
    // keeping it simple: if any of added IDs are in WANT, remove them from WANT.
    setWant(prev => prev.filter(fid => !ids.includes(fid)));
  };
  
  const handleToggleWant = (idOrIds: FortnightId | FortnightId[]) => {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    
    // Prevent selecting if it's already in 'have'
    const validIds = ids.filter(id => !have.includes(id));
    
    setWant(prev => {
        const newSet = new Set(prev);
        const allPresent = validIds.every(id => newSet.has(id));
        
        if (allPresent) {
             validIds.forEach(id => newSet.delete(id));
        } else {
             validIds.forEach(id => newSet.add(id));
        }
        return Array.from(newSet);
    });
  };


  const handleSearch = () => {
    setSearched(true);
    setSearchTrigger(prev => prev + 1); // Increment to force re-render of the result block animation

    if (have.length === 0 || want.length === 0) {
      setResults([]);
      return;
    }
    const foundMatches = relevantRequests.filter(req => {
        // Find people who want at least one of the things I have
        const theyWantWhatIHave = have.some(h => req.wants.includes(h));
        // And who have at least one of the things I want
        const theyHaveWhatIWant = want.some(w => req.has.includes(w));
        return theyWantWhatIHave && theyHaveWhatIWant;
    });
    setResults(foundMatches);
    
    // Smooth scroll to results
    setTimeout(() => {
        if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
      <p className="text-gray-600 text-center font-medium">Explora: Quien Tiene lo que Buscas y Quiere lo que Tienes.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card title="Tengo (Máximo 3)">
          <FortnightSelector selected={have} onToggle={handleToggleHave} limit={3} />
        </Card>
        <Card title="Quiero (Sin límite)">
          <FortnightSelector selected={want} onToggle={handleToggleWant} disabledIds={have} />
        </Card>
      </div>

      <div className="pt-4">
        <button
          onClick={handleSearch}
          disabled={have.length === 0 || want.length === 0}
          className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all transform active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
        >
          Buscar Coincidencias Directas
        </button>
      </div>


      {searched && results !== null && (
        <div ref={resultsRef} key={searchTrigger} className="mt-8 transition-all duration-500 ease-out transform translate-y-0 opacity-100 scale-100">
            {results.length > 0 ? (
                <div className="bg-green-50 border-4 border-green-500 p-6 rounded-xl shadow-2xl relative overflow-hidden animate-pulse-strong">
                    {/* Decorative background glow */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-green-300 rounded-full opacity-20 blur-2xl pointer-events-none"></div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 relative z-10 border-b border-green-200 pb-4">
                         <div className="bg-green-100 p-3 rounded-full border-2 border-green-400 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-700" fill="none" viewBox="0 0 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                         </div>
                         <div className="text-center sm:text-left">
                            <h4 className="text-2xl font-extrabold text-green-800">¡Bingo! {results.length} Coincidencia{results.length !== 1 ? 's' : ''} Encontrada{results.length !== 1 ? 's' : ''}</h4>
                            <p className="text-green-700 font-medium mt-1">
                                Estos compañeros tienen exactamente lo que buscas y quieren lo que tú ofreces.
                            </p>
                         </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-green-200 shadow-inner">
                        <SwapList requests={results} onSimulateUser={onSimulateUser} />
                    </div>
                </div>
            ) : (
                 <div className="bg-orange-50 border-4 border-orange-300 p-8 rounded-xl text-center shadow-xl relative overflow-hidden">
                     {/* Decorative background warning pattern */}
                     <div className="absolute top-0 left-0 w-full h-2 bg-orange-300"></div>

                     <div className="mx-auto h-16 w-16 text-orange-500 mb-4 bg-orange-100 rounded-full flex items-center justify-center border-2 border-orange-200 shadow-sm animate-bounce">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                     </div>
                    <h4 className="text-2xl font-extrabold text-orange-800 mb-2">Ups, sin coincidencias directas</h4>
                    <p className="text-orange-700 font-medium max-w-md mx-auto">
                        Nadie cumple con tus criterios exactos en este momento. 
                    </p>
                    <div className="mt-4 p-3 bg-white/60 rounded-lg inline-block border border-orange-200">
                        <p className="text-sm text-orange-600">
                            💡 Consejo: Prueba a añadir más opciones en <strong>"Quiero"</strong> para aumentar tus posibilidades.
                        </p>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default QuickMatchFinder;
