
import * as React from 'react';
import type { RestSwapRequest } from '../types';
import { MONTHS } from '../constants';

interface RestAvailabilityCalendarProps {
  requests: RestSwapRequest[];
  onManageSwap: (request: RestSwapRequest) => void;
}

const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const PILL_COLORS = ['bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-rose-500'];

const VacationCalendarView: React.FC<RestAvailabilityCalendarProps> = ({ requests, onManageSwap }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const requestsByDate = React.useMemo(() => {
    const map = new Map<string, RestSwapRequest[]>();
    requests.forEach(req => {
      req.offeredDays.forEach(dayString => {
        // Create date object correctly from YYYY-MM-DD string to avoid timezone issues
        const dateParts = dayString.split('-').map(Number);
        const dayDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        const dateKey = dayDate.toDateString();
        
        const entries = map.get(dateKey) || [];
        map.set(dateKey, [...entries, req]);
      });
    });
    return map;
  }, [requests]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday is 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4 p-2 rounded-lg bg-gray-50">
      <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Mes anterior">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      <h3 className="text-xl font-bold text-gray-800">
        {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
      </h3>
      <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Mes siguiente">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );

  const renderDaysOfWeek = () => (
    <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-gray-600 mb-2">
      {WEEK_DAYS.map(day => <div key={day}>{day}</div>)}
    </div>
  );

  const renderCells = () => {
    const blanks = Array(startingDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const today = new Date();
    
    return (
      <div className="grid grid-cols-7 gap-2">
        {blanks.map((_, i) => <div key={`blank-${i}`} className="border rounded-lg bg-gray-50/50" />)}
        {days.map(day => {
          const cellDate = new Date(year, month, day);
          const dateKey = cellDate.toDateString();
          const dayRequests = requestsByDate.get(dateKey) || [];
          // FIX: De-duplicate requests by ID to ensure each person is only shown once per day. This also helps with type inference.
          const uniqueDayRequests = Array.from(new Map(dayRequests.map(item => [item.id, item])).values());
          const isToday = today.toDateString() === dateKey;

          return (
            <div
              key={day}
              className={`border rounded-lg p-2 min-h-[120px] flex flex-col ${isToday ? 'bg-teal-50 border-teal-300' : 'bg-white'}`}
            >
              <span className={`font-bold ${isToday ? 'text-teal-600' : 'text-gray-700'}`}>{day}</span>
              <div className="mt-1 space-y-1 overflow-y-auto">
                 {/* FIX: Explicitly type 'req' as RestSwapRequest to resolve type inference issues. */}
                 {uniqueDayRequests.map((req: RestSwapRequest, index) => (
                    <button 
                        key={req.id}
                        onClick={() => onManageSwap(req)}
                        className={`w-full text-left px-2 py-0.5 text-xs font-semibold text-white rounded truncate transition-transform transform hover:scale-105 ${PILL_COLORS[index % PILL_COLORS.length]}`}
                        title={`${req.employeeName.split(' (')[0]}: ${req.reason}`}
                    >
                        {req.employeeName.split(' (')[0]}
                    </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
      <p className="text-sm text-gray-600 mb-4 text-center">
        Aquí puedes ver todos los días de descanso que los compañeros de tu grupo han publicado para intercambiar. Haz clic en un nombre para abrir la gestión de cambio.
      </p>
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
};

export default VacationCalendarView;
