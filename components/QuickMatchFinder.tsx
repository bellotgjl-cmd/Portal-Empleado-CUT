
import * as React from 'react';
import type { FortnightId, SwapRequest } from '../types';
import FortnightSelector from './FortnightSelector';
import SwapList from './SwapList';

interface QuickMatchFinderProps {
  allRequests: SwapRequest[];
  currentUserType: 'Conductor' | 'Taller';
}

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-inner border border-gray-200">
    <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
    {children}
  </div>
);


const QuickMatchFinder: React.FC<QuickMatchFinderProps> = ({ allRequests, currentUserType }) => {
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
        <div className="border-t pt-6 mt-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Resultados de la búsqueda ({results.length})</h4>
          {results.length > 0 ? (
            <SwapList requests={results} />
          ) : (
            <p className="text-gray-500 text-center bg-gray-50 p-4 rounded-lg">No se encontraron coincidencias directas para esta combinación.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuickMatchFinder;