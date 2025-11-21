
import * as React from 'react';
import { FORTNIGHTS, MONTHS, getFullMonthId } from '../constants';
import type { FortnightId } from '../types';

interface FortnightSelectorProps {
  selected: FortnightId[];
  onToggle: (id: FortnightId | FortnightId[]) => void;
  limit?: number;
  disabledIds?: FortnightId[];
  forceSplitSelection?: boolean; // NEW: If true, "Full Month" selects 1st and 2nd fortnight separately, never the 'month-full' ID.
}

const FortnightSelector: React.FC<FortnightSelectorProps> = ({ selected, onToggle, limit, disabledIds = [], forceSplitSelection = false }) => {
  
  const handleToggle = (id: FortnightId) => {
    const isSelected = selected.includes(id);
    if (!isSelected && limit && selected.length >= limit) {
      return;
    }
    onToggle(id);
  };

  const handleMonthToggle = (month: string) => {
    const fullMonthId = getFullMonthId(month);
    const monthFortnights = FORTNIGHTS.filter(f => f.month === month).map(f => f.id);

    // --- LOGIC A: SPLIT SELECTION (For Initial Assignment) ---
    if (forceSplitSelection) {
        // Check how many of the individual fortnights are currently selected
        const selectedInMonth = monthFortnights.filter(id => selected.includes(id));
        const allSelected = selectedInMonth.length === monthFortnights.length;

        if (allSelected) {
            // If all are selected, we want to DESELECT all of them
            // Pass the array of IDs to toggle (which will remove them)
            onToggle(monthFortnights);
        } else {
            // If some or none are selected, we want to SELECT the missing ones
            const missing = monthFortnights.filter(id => !selected.includes(id));
            
            // Check limits
            if (limit !== undefined && (selected.length + missing.length > limit)) {
                return; // Cannot select all because of limit
            }
            
            // Toggle only the missing ones to add them
            onToggle(missing);
        }
        return;
    }

    // --- LOGIC B: STANDARD SELECTION (For Wants/Requests) ---
    const isFullMonthSelected = selected.includes(fullMonthId);

    if (isFullMonthSelected) {
      onToggle(fullMonthId); // Just deselect it
    } else {
      // We want to select it
      const selectedInMonth = monthFortnights.filter(id => selected.includes(id));

      // Check limit: we are removing N items and adding 1. Net change is 1 - N.
      if (limit !== undefined && (selected.length - selectedInMonth.length + 1 > limit)) {
          // Can't select, would exceed limit
          return;
      }

      // Deselect individual fortnights for this month that are currently selected
      // We can do this by passing them to onToggle (which toggles them off)
      // Then toggle the full month on.
      // We bundle this:
      const idsToToggle = [...selectedInMonth, fullMonthId];
      onToggle(idsToToggle);
    }
  };

  return (
    <div className="space-y-4">
      {MONTHS.map(month => {
        const fullMonthId = getFullMonthId(month);
        
        const monthFortnights = FORTNIGHTS.filter(f => f.month === month);
        const selectedFortnightsInMonthCount = monthFortnights.filter(f => selected.includes(f.id)).length;
        
        // Determine if "Full Month" box should be checked
        // In Split Mode: Checked if ALL individual fortnights are checked.
        // In Standard Mode: Checked if the specific fullMonthId is checked.
        const isFullMonthChecked = forceSplitSelection 
            ? selectedFortnightsInMonthCount === monthFortnights.length
            : selected.includes(fullMonthId);

        // Disable month toggle if:
        // 1. Limit is reached (and not already selected)
        // 2. OR the full month itself is in disabledIds (Standard Mode)
        // 3. OR ANY of the individual fortnights are disabled (Split Mode - strict)
        // 4. OR if in Standard mode, individual fortnights are disabled (complex check)
        
        let isMonthToggleDisabled = false;
        if (forceSplitSelection) {
             const missingCount = monthFortnights.length - selectedFortnightsInMonthCount;
             // If not fully selected, check if we have room to add the missing ones
             if (!isFullMonthChecked && limit !== undefined && (selected.length + missingCount > limit)) {
                 isMonthToggleDisabled = true;
             }
             // If any individual fortnight is disabled, we can't bulk select cleanly
             if (monthFortnights.some(f => disabledIds.includes(f.id))) {
                 isMonthToggleDisabled = true;
             }
        } else {
             if (!isFullMonthChecked && limit !== undefined && (selected.length - selectedFortnightsInMonthCount + 1 > limit)) {
                 isMonthToggleDisabled = true;
             }
             if (disabledIds.includes(fullMonthId)) {
                 isMonthToggleDisabled = true;
             }
        }
        
        const uniqueId = `month-toggle-${month.toLowerCase()}-${limit !== undefined ? limit : 'none'}-${forceSplitSelection ? 'split' : 'std'}`;

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
                  checked={isFullMonthChecked}
                  onChange={() => handleMonthToggle(month)}
                  disabled={isMonthToggleDisabled}
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-200"
                  aria-label={`Seleccionar mes completo de ${month}`}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {monthFortnights.map(fortnight => {
                const isSelected = selected.includes(fortnight.id);
                
                let isDisabled = disabledIds.includes(fortnight.id);
                
                // In Standard Mode, disable individual if Full Month ID is selected
                if (!forceSplitSelection && selected.includes(fullMonthId)) {
                    isDisabled = true;
                }
                // Limit check
                if (!isSelected && limit !== undefined && selected.length >= limit) {
                    isDisabled = true;
                }
                
                if (!forceSplitSelection && disabledIds.includes(fullMonthId)) {
                    isDisabled = true;
                }

                const buttonClass = isSelected
                  ? 'bg-teal-600 text-white shadow-md'
                  : isDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white hover:bg-teal-100 text-gray-800';

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
