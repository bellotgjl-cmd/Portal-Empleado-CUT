
// FIX: Added RestSwapRequest and Debt to the import to support new demo data.
import type { SwapRequest, Transaction, RestSwapRequest, Debt, Administrator } from './types';

// --- CONFIGURATION ---
// Set to `false` for production to enforce strict validation.
export const IS_DEVELOPMENT_MODE = true;


export const ADMINISTRATORS: Administrator[] = [
  { id: 'admin-master', name: 'JLBG', email: 'bellotgjl@gmail.com', whatsapp: '645515863', role: 'master' },
];

export const MONTHS: string[] = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export interface FortnightOption {
    id: string;
    label: string;
    month: string;
}

export const FORTNIGHTS: FortnightOption[] = MONTHS.flatMap(month => [
  { id: `${month.toLowerCase()}-1`, label: `1ª ${month}`, month },
  { id: `${month.toLowerCase()}-2`, label: `2ª ${month}`, month }
]);

export const getFullMonthId = (month: string): string => `${month.toLowerCase()}-full`;
export const isFullMonthId = (id: string): boolean => id.endsWith('-full');
export const getMonthFromId = (id: string): string => {
    const monthId = id.split('-')[0];
    const month = MONTHS.find(m => m.toLowerCase() === monthId);
    return month || 'Desconocido';
};

// Helper to expand a potentially mixed list of IDs (some regular, some 'full-month') into purely regular IDs
export function expandFortnightIds(ids: string[]): string[] {
    const expanded: string[] = [];
    ids.forEach(id => {
        if (isFullMonthId(id)) {
            const month = getMonthFromId(id);
            expanded.push(`${month.toLowerCase()}-1`);
            expanded.push(`${month.toLowerCase()}-2`);
        } else {
            expanded.push(id);
        }
    });
    return expanded;
}


export function getFortnightLabel(id: string): string {
    if (isFullMonthId(id)) {
        const month = getMonthFromId(id);
        return `${month} (Mes Completo)`;
    }
    const fortnight = FORTNIGHTS.find(f => f.id === id);
    return fortnight ? `${fortnight.label.replace(fortnight.month, 'de ' + fortnight.month)}` : 'Desconocido';
}

export function getAbbreviatedFortnightLabel(id: string): string {
    if (isFullMonthId(id)) {
        const month = getMonthFromId(id);
        return `${month} (Mes)`;
    }
    const fortnight = FORTNIGHTS.find(f => f.id === id);
    if (!fortnight) return 'Desc.';
    
    const monthName = fortnight.month;
    
    // Special case for Septiembre as requested
    if (monthName.toLowerCase() === 'septiembre') {
         return id.endsWith('-1') ? '1ª Sept.' : '2ª Sept.';
    }
    
    let shortMonth = monthName;
    // Abbreviate if longer than 4 chars (e.g. Enero -> Ene., Mayo stays Mayo)
    if (monthName.length > 4) {
        shortMonth = monthName.substring(0, 3) + '.';
    }
    
    const part = id.endsWith('-1') ? '1ª' : '2ª';
    return `${part} ${shortMonth}`;
}

export function groupFortnights(ids: string[]) {
    const sortedIds = [...ids].sort((a, b) => {
        const getMonthIndex = (id: string) => {
            const monthPart = id.split('-')[0];
            return MONTHS.findIndex(m => m.toLowerCase() === monthPart);
        };
        const monthA = getMonthIndex(a);
        const monthB = getMonthIndex(b);
        return monthA !== monthB ? monthA - monthB : a.localeCompare(b);
    });

    const idsByMonth: Record<string, string[]> = {};
    sortedIds.forEach(id => {
        const month = id.split('-')[0];
        if (!idsByMonth[month]) idsByMonth[month] = [];
        idsByMonth[month].push(id);
    });

    const fullMonths: string[][] = [];
    const singles: string[] = [];

    MONTHS.forEach(m => {
        const mKey = m.toLowerCase();
        if (idsByMonth[mKey]) {
            // If it explicitly contains the 'full' ID, treat it as a single unit in the singles list (or handle differently if needed)
            // But for "Current Holdings" logic where we have [m-1, m-2], we group them.
            const hasFullId = idsByMonth[mKey].some(id => isFullMonthId(id));
            
            if (hasFullId) {
                singles.push(...idsByMonth[mKey]);
            } else if (idsByMonth[mKey].length === 2) {
                fullMonths.push(idsByMonth[mKey]);
            } else {
                singles.push(...idsByMonth[mKey]);
            }
        }
    });

    return { fullMonths, singles };
}

// --- TEST DATA (DEMO USERS) ---
// Updated Requirement: EVERYONE must have exactly 3 Fortnights assigned (Has).
// But they can have UNLIMITED Wants.
// Juan has: Agosto-2, Septiembre-1, Septiembre-2 (3 total). Wants: Enero-1, Enero-2, Febrero-1, Febrero-2, Marzo-1 (5 total)
// Ana has: Enero-1, Enero-2, Febrero-1 (3 total). Wants: Agosto-2, Septiembre-1, Septiembre-2, Octubre-1 (4 total)

export const DEMO_USERS = [
    {
        employeeId: '1001',
        employeeName: 'Juan Pérez (Demo)',
        employeeType: 'Conductor',
        email: 'juan.demo@portal.com',
        whatsapp: '600111222',
        password: '123',
        initialAssignment: ['agosto-2', 'septiembre-1', 'septiembre-2'],
        has: ['agosto-2', 'septiembre-1', 'septiembre-2'],
        wants: ['enero-1', 'enero-2', 'febrero-1', 'febrero-2', 'marzo-1'],
        status: 'active',
        id: '1001'
    },
    {
        employeeId: '1002',
        employeeName: 'Ana Gómez (Match)',
        employeeType: 'Conductor',
        email: 'ana.demo@portal.com',
        whatsapp: '600333444',
        password: '123',
        initialAssignment: ['enero-1', 'enero-2', 'febrero-1'],
        has: ['enero-1', 'enero-2', 'febrero-1'],
        wants: ['agosto-2', 'septiembre-1', 'septiembre-2', 'octubre-1'],
        status: 'active',
        id: '1002'
    },
    {
        employeeId: '1003',
        employeeName: 'Pedro Taller (Demo)',
        employeeType: 'Taller',
        email: 'pedro.demo@portal.com',
        whatsapp: '600555666',
        password: '123',
        initialAssignment: ['julio-1', 'julio-2', 'agosto-1'],
        has: ['julio-1', 'julio-2', 'agosto-1'],
        wants: ['diciembre-1', 'diciembre-2', 'enero-1', 'enero-2'],
        status: 'active',
        id: '1003'
    },
    {
        employeeId: '1004',
        employeeName: 'Laura Bus (Match)',
        employeeType: 'Conductor',
        email: 'laura.demo@portal.com',
        whatsapp: '600777888',
        password: '123',
        initialAssignment: ['diciembre-1', 'diciembre-2', 'enero-1'],
        has: ['diciembre-1', 'diciembre-2', 'enero-1'],
        wants: ['julio-1', 'julio-2', 'agosto-1', 'agosto-2', 'septiembre-1'],
        status: 'active',
        id: '1004'
    },
    {
        employeeId: '1005',
        employeeName: 'Carlos Mecánico (Demo)',
        employeeType: 'Taller',
        email: 'carlos.demo@portal.com',
        whatsapp: '600999000',
        password: '123',
        initialAssignment: ['marzo-1', 'marzo-2', 'abril-1'],
        has: ['marzo-1', 'marzo-2', 'abril-1'],
        wants: ['agosto-1', 'agosto-2', 'septiembre-1', 'septiembre-2'],
        status: 'active',
        id: '1005'
    },
    {
        employeeId: '1006',
        employeeName: 'Maria Jefa Taller (Match)',
        employeeType: 'Taller',
        email: 'maria.demo@portal.com',
        whatsapp: '600123123',
        password: '123',
        initialAssignment: ['agosto-1', 'agosto-2', 'septiembre-1'],
        has: ['agosto-1', 'agosto-2', 'septiembre-1'],
        wants: ['marzo-1', 'marzo-2', 'abril-1'],
        status: 'active',
        id: '1006'
    },
    // NEW USERS
    {
        employeeId: '1007',
        employeeName: 'Antonio Noviembre (Demo)',
        employeeType: 'Conductor',
        email: 'antonio.demo@portal.com',
        whatsapp: '600111223',
        password: '123',
        initialAssignment: ['noviembre-1', 'noviembre-2', 'diciembre-1'],
        has: ['noviembre-1', 'noviembre-2', 'diciembre-1'],
        wants: ['mayo-1', 'mayo-2', 'junio-1', 'junio-2', 'julio-1'],
        status: 'active',
        id: '1007'
    },
    {
        employeeId: '1008',
        employeeName: 'Beatriz Mayo (Match)',
        employeeType: 'Conductor',
        email: 'beatriz.demo@portal.com',
        whatsapp: '600111224',
        password: '123',
        initialAssignment: ['mayo-1', 'mayo-2', 'junio-1'],
        has: ['mayo-1', 'mayo-2', 'junio-1'],
        wants: ['noviembre-1', 'noviembre-2', 'diciembre-1'],
        status: 'active',
        id: '1008'
    },
];

// --- INITIAL STATE DATA ---

// Populate active requests so matches appear immediately
export const initialRequests: SwapRequest[] = DEMO_USERS.map(u => ({
    id: u.id,
    employeeId: u.employeeId,
    employeeName: u.employeeName,
    employeeType: u.employeeType as any,
    email: u.email,
    whatsapp: u.whatsapp,
    has: u.has,
    wants: u.wants,
    status: 'active'
}));

export const initialTransactions: Transaction[] = [];

export const allRequestsEverForDemo: SwapRequest[] = [];


// --- REST SWAP INITIAL DATA ---

export const initialRestRequests: RestSwapRequest[] = [];

export const initialDebts: Debt[] = [];
