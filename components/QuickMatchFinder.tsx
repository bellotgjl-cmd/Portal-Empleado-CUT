
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

  const relevantRequests = React.useMemo(() => {
    return allRequests.filter(req => req.employeeType === currentUserType);
  }, [allRequests, currentUserType]);

  const handleToggleHave = (id: FortnightId) => {
    const isAdding = !have.includes(id);

    setHave(prev => {
        const newHave = prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id];
        return newHave;
    });

    // If adding to 'have', ensure it's removed from 'want'
    if (isAdding) {
        setWant(prev => prev.filter(fid => fid !== id));
    }
  };
  
  const handleToggleWant = (id: FortnightId) => {
    // This check is redundant if disabledIds works correctly, but it's good for safety
    if (have.includes(id)) return;
    setWant(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  };


  const handleSearch = () => {
    setSearched(true);
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
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
      <p className="text-gray-600 text-center">Comprueba rápidamente si alguien de tu mismo grupo ({currentUserType}) tiene lo que buscas y quiere lo que tienes.</p>
      
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
          className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
        >
          Buscar Coincidencias Directas
        </button>
      </div>


      {searched && results !== null && (
        <div className="mt-8 animate-pulse-strong">
            {results.length > 0 ? (
                <div className="bg-green-50 border-2 border-green-500 p-6 rounded-xl shadow-xl relative overflow-hidden">
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

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-green-200 shadow-inner">
                        <SwapList requests={results} onSimulateUser={onSimulateUser} />
                    </div>
                </div>
            ) : (
                 <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl text-center">
                     <div className="mx-auto h-12 w-12 text-gray-300 mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                     </div>
                    <h4 className="text-lg font-bold text-gray-600">Sin coincidencias directas</h4>
                    <p className="text-gray-500">Nadie cumple con tus criterios exactos en este momento. Prueba a ampliar lo que buscas.</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default QuickMatchFinder;
