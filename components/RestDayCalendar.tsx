
import * as React from 'react';

interface RestDayCalendarProps {
  selectedDays: string[];
  onDayToggle: (day: string) => void;
}

const WEEK_DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

const RestDayCalendar: React.FC<RestDayCalendarProps> = ({ selectedDays, onDayToggle }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust to make Monday the first day of the week (0=Mon, 6=Sun)
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200" aria-label="Mes anterior">
        &lt;
      </button>
      <h3 className="text-lg font-semibold">
        {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
      </h3>
      <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200" aria-label="Mes siguiente">
        &gt;
      </button>
    </div>
  );

  const renderDaysOfWeek = () => (
    <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500">
      {WEEK_DAYS.map(day => <div key={day}>{day}</div>)}
    </div>
  );

  const renderCells = () => {
    const blanks = Array(startingDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneYearFromNow = new Date(today);
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    return (
      <div className="grid grid-cols-7 gap-1 mt-2">
        {blanks.map((_, i) => <div key={`blank-${i}`} />)}
        {days.map(day => {
          const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = selectedDays.includes(dayString);
          
          const cellDate = new Date(year, month, day);
          const isPast = cellDate < today;
          const isTooFar = cellDate > oneYearFromNow;
          const isDisabled = isPast || isTooFar;

          let buttonClass = "w-full aspect-square flex items-center justify-center rounded-full transition-colors duration-200 text-sm ";
          if (isDisabled) {
              buttonClass += "text-gray-400 cursor-not-allowed bg-gray-100";
          } else if (isSelected) {
              buttonClass += "bg-indigo-600 text-white font-bold shadow-md";
          } else {
              buttonClass += "hover:bg-indigo-100";
          }
          
          return (
            <button
              key={day}
              onClick={() => !isDisabled && onDayToggle(dayString)}
              disabled={isDisabled}
              className={buttonClass}
            >
              {day}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
};

export default RestDayCalendar;