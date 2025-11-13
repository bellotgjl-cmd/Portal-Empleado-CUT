import React from 'react';
import { FORTNIGHTS, MONTHS, getFullMonthId } from '../constants';
import type { FortnightId } from '../types';

interface FortnightSelectorProps {
  selected: FortnightId[];
  onToggle: (id: FortnightId) => void;
  limit?: number;
  disabledIds?: FortnightId[];
}

const FortnightSelector: React.FC<FortnightSelectorProps> = ({ selected, onToggle, limit, disabledIds = [] }) => {
  const handleToggle = (id: FortnightId) => {
    const isSelected = selected.includes(id);
    if (!isSelected && limit && selected.length >= limit) {
      return;
    }
    onToggle(id);
  };

  const handleMonthToggle = (month: string) => {
    const fullMonthId = getFullMonthId(month);
    const isFullMonthSelected = selected.includes(fullMonthId);

    if (isFullMonthSelected) {
      onToggle(fullMonthId); // Just deselect it
    } else {
      // We want to select it
      const monthFortnights = FORTNIGHTS.filter(f => f.month === month).map(f => f.id);
      const selectedInMonth = monthFortnights.filter(id => selected.includes(id));

      // Check limit: we are removing N items and adding 1. Net change is 1 - N.
      if (limit !== undefined && (selected.length - selectedInMonth.length + 1 > limit)) {
          // Can't select, would exceed limit
          return;
      }

      // Deselect individual fortnights for this month that are currently selected
      selectedInMonth.forEach(id => {
          if (selected.includes(id)) {
              onToggle(id);
          }
      });
      // Select the full month
      onToggle(fullMonthId);
    }
  };

  return (
    <div className="space-y-4">
      {MONTHS.map(month => {
        const fullMonthId = getFullMonthId(month);
        const isFullMonthSelected = selected.includes(fullMonthId);

        const monthFortnights = FORTNIGHTS.filter(f => f.month === month);
        
        const selectedFortnightsInMonthCount = monthFortnights.filter(f => selected.includes(f.id)).length;
        const isMonthToggleDisabled = !isFullMonthSelected && limit !== undefined && (selected.length - selectedFortnightsInMonthCount + 1 > limit) || monthFortnights.every(f => disabledIds.includes(f.id));
        
        // Create a unique identifier for the checkbox to avoid duplicate IDs in the DOM
        const uniqueId = `month-toggle-${month.toLowerCase()}-${limit !== undefined ? limit : 'none'}`;

        return (
          <div key={month}>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-700">{month}</h4>
              <div className="flex items-center space-x-2">
                <label 
                  htmlFor={uniqueId}
                  className={`text-sm font-medium ${isMonthToggleDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 cursor-pointer'}`}
                >
                  Mes Completo
                </label>
                <input
                  type="checkbox"
                  id={uniqueId}
                  checked={isFullMonthSelected}
                  onChange={() => handleMonthToggle(month)}
                  disabled={isMonthToggleDisabled}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-200"
                  aria-label={`Seleccionar mes completo de ${month}`}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {monthFortnights.map(fortnight => {
                const isSelected = selected.includes(fortnight.id);
                // Disable individual fortnights if the full month is selected, the selection limit is reached, or it's in the disabledIds list.
                const isDisabled = isFullMonthSelected || (!isSelected && limit !== undefined && selected.length >= limit) || disabledIds.includes(fortnight.id);
                const buttonClass = isSelected
                  ? 'bg-indigo-600 text-white shadow-md'
                  : isDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white hover:bg-indigo-100 text-gray-800';

                return (
                  <button
                    key={fortnight.id}
                    type="button"
                    onClick={() => !isDisabled && handleToggle(fortnight.id)}
                    disabled={isDisabled}
                    className={`w-full text-sm text-center p-2 rounded-lg border border-gray-300 transition-all duration-200 ${buttonClass}`}
                  >
                    {fortnight.label.split(' ')[0]} Quincena
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FortnightSelector;
