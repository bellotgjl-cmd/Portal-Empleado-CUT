
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


export function getFortnightLabel(id: string): string {
    if (isFullMonthId(id)) {
        const month = getMonthFromId(id);
        return `${month} (Mes Completo)`;
    }
    const fortnight = FORTNIGHTS.find(f => f.id === id);
    return fortnight ? `${fortnight.label.replace(fortnight.month, 'de ' + fortnight.month)}` : 'Desconocido';
}

// --- TEST DATA (DEMO USERS) ---
// Updated to reflect request: Have 'agosto-2', Want 'enero-1'
// Counterparts created to ensure matches exist.
export const DEMO_USERS = [
    {
        employeeId: '1001',
        employeeName: 'Juan Pérez (Demo)',
        employeeType: 'Conductor',
        email: 'juan.demo@portal.com',
        whatsapp: '600111222',
        password: '123',
        initialAssignment: ['agosto-2'],
        has: ['agosto-2'],
        wants: ['enero-1'],
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
        initialAssignment: ['enero-1'],
        has: ['enero-1'],
        wants: ['agosto-2'],
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
        initialAssignment: ['agosto-2'],
        has: ['agosto-2'],
        wants: ['enero-1'],
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
        initialAssignment: ['enero-1'],
        has: ['enero-1'],
        wants: ['agosto-2'],
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
        initialAssignment: ['agosto-2'],
        has: ['agosto-2'],
        wants: ['enero-1'],
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
        initialAssignment: ['enero-1'],
        has: ['enero-1'],
        wants: ['agosto-2'],
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
        initialAssignment: ['agosto-2'],
        has: ['agosto-2'],
        wants: ['enero-1'],
        status: 'active',
        id: '1007'
    },
    {
        employeeId: '1008',
        employeeName: 'Beatriz Diciembre (Match)',
        employeeType: 'Conductor',
        email: 'beatriz.demo@portal.com',
        whatsapp: '600111224',
        password: '123',
        initialAssignment: ['enero-1'],
        has: ['enero-1'],
        wants: ['agosto-2'],
        status: 'active',
        id: '1008'
    },
    {
        employeeId: '1009',
        employeeName: 'Luis Abril (Demo)',
        employeeType: 'Conductor',
        email: 'luis.demo@portal.com',
        whatsapp: '600111225',
        password: '123',
        initialAssignment: ['agosto-2'],
        has: ['agosto-2'],
        wants: ['enero-1'],
        status: 'active',
        id: '1009'
    },
    {
        employeeId: '1010',
        employeeName: 'Elena Mayo (Match)',
        employeeType: 'Conductor',
        email: 'elena.demo@portal.com',
        whatsapp: '600111226',
        password: '123',
        initialAssignment: ['enero-1'],
        has: ['enero-1'],
        wants: ['agosto-2'],
        status: 'active',
        id: '1010'
    }
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
