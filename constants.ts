

// FIX: Added RestSwapRequest and Debt to the import to support new demo data.
import type { SwapRequest, Transaction, RestSwapRequest, Debt } from './types';

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

// --- DEMO DATA ---

const updatedContactInfo = {
    email: 'bellotgjl@gmail.com',
    whatsapp: '645515863'
};

const baseRequests: Omit<SwapRequest, 'email' | 'whatsapp'>[] = [
    // Se han eliminado de esta lista los usuarios que ya tienen un caso de éxito
    // para mantener la coherencia de los datos. Sus solicitudes ya no están "activas".
    // { id: 'C001', employeeId: 'C001', employeeName: 'Ana García', employeeType: 'Conductor', has: ['julio-1', 'agosto-2'], wants: ['enero-1', 'diciembre-2'] }, // In TS007
    // { id: 'C002', employeeId: 'C002', employeeName: 'Carlos Rodriguez', employeeType: 'Conductor', has: ['enero-1', 'junio-1'], wants: ['julio-1', 'agosto-1'] }, // In TS007
    { id: 'C003', employeeId: 'C003', employeeName: 'Lucía Fernández', employeeType: 'Conductor', has: ['agosto-1', 'septiembre-1'], wants: ['junio-2', 'diciembre-1'] },
    // { id: 'C004', employeeId: 'C004', employeeName: 'Javier Moreno', employeeType: 'Conductor', has: ['mayo-2', 'octubre-1'], wants: ['julio-2', 'septiembre-2'] }, // In TS010
    { id: 'C005', employeeId: 'C005', employeeName: 'Elena Jiménez', employeeType: 'Conductor', has: ['diciembre-1'], wants: ['agosto-1'] },
    { id: 'C006', employeeId: 'C006', employeeName: 'Miguel Ruiz', employeeType: 'Conductor', has: ['febrero-1', 'noviembre-2'], wants: ['marzo-1', 'julio-1'] },
    // { id: 'C007', employeeId: 'C007', employeeName: 'Isabel Alonso', employeeType: 'Conductor', has: ['julio-2'], wants: ['mayo-2'] }, // In TS010
    { id: 'C008', employeeId: 'C008', employeeName: 'David Sanz', employeeType: 'Conductor', has: ['marzo-1'], wants: ['febrero-1'] },
    // Taller (8)
    { id: 'T001', employeeId: 'T001', employeeName: 'Sofía Martínez', employeeType: 'Taller', has: ['septiembre-2', 'octubre-1'], wants: ['mayo-1', 'junio-2'] },
    { id: 'T002', employeeId: 'T002', employeeName: 'David López', employeeType: 'Taller', has: ['mayo-1', 'diciembre-2'], wants: ['agosto-1', 'septiembre-2'] },
    // { id: 'T003', employeeId: 'T003', employeeName: 'Laura González', employeeType: 'Taller', has: ['julio-1'], wants: ['agosto-2'] }, // In TS008
    // { id: 'T004', employeeId: 'T004', employeeName: 'Pablo Pérez', employeeType: 'Taller', has: ['agosto-2'], wants: ['julio-1'] }, // In TS008
    { id: 'T005', employeeId: 'T005', employeeName: 'Carmen Romero', employeeType: 'Taller', has: ['junio-2'], wants: ['septiembre-2'] },
    { id: 'T006', employeeId: 'T006', employeeName: 'Adrián Sánchez', employeeType: 'Taller', has: ['enero-2', 'febrero-1'], wants: ['noviembre-1', 'diciembre-1'] },
    // { id: 'T007', employeeId: 'T007', employeeName: 'Paula Díaz', employeeType: 'Taller', has: ['marzo-2'], wants: ['abril-1'] }, // In TS009
    // { id: 'T008', employeeId: 'T008', employeeName: 'Sergio Gil', employeeType: 'Taller', has: ['abril-1'], wants: ['marzo-2'] }, // In TS009
];

const newUser: Omit<SwapRequest, 'email' | 'whatsapp'> = {
    id: '3728',
    employeeId: '3728',
    employeeName: 'José Luis Bellot Gamez',
    employeeType: 'Conductor',
    has: ['junio-2', 'septiembre-2'],
    wants: ['agosto-1', 'diciembre-1']
};

// -- Vacation Swap App Data --
export const initialRequests: SwapRequest[] = [
    { ...newUser, ...updatedContactInfo },
    ...baseRequests.map(req => ({ ...req, ...updatedContactInfo }))
];

export const initialTransactions: Transaction[] = [
    // Casos de éxito (10)
    { id: 'TS001', initiatorId: 'C009', receiverId: 'C010', initiatorGives: ['junio-1'], receiverGives: ['julio-1'], timestamp: Date.now() - 86400000 * 5, status: 'confirmed' },
    { id: 'TS002', initiatorId: 'C011', receiverId: 'C012', initiatorGives: ['agosto-2'], receiverGives: ['septiembre-1'], timestamp: Date.now() - 86400000 * 12, status: 'confirmed' },
    { id: 'TS003', initiatorId: 'T009', receiverId: 'T010', initiatorGives: ['mayo-1'], receiverGives: ['octubre-2'], timestamp: Date.now() - 86400000 * 8, status: 'confirmed' },
    { id: 'TS004', initiatorId: 'C013', receiverId: 'C014', initiatorGives: ['diciembre-1'], receiverGives: ['enero-2'], timestamp: Date.now() - 86400000 * 20, status: 'confirmed' },
    { id: 'TS005', initiatorId: 'T011', receiverId: 'T012', initiatorGives: ['febrero-2'], receiverGives: ['marzo-1'], timestamp: Date.now() - 86400000 * 3, status: 'confirmed' },
    { id: 'TS006', initiatorId: 'C015', receiverId: 'C016', initiatorGives: ['noviembre-1'], receiverGives: ['abril-2'], timestamp: Date.now() - 86400000 * 15, status: 'confirmed' },
    { id: 'TS007', initiatorId: 'C001', receiverId: 'C002', initiatorGives: ['julio-1'], receiverGives: ['enero-1'], timestamp: Date.now() - 86400000 * 25, status: 'confirmed' },
    { id: 'TS008', initiatorId: 'T003', receiverId: 'T004', initiatorGives: ['julio-1'], receiverGives: ['agosto-2'], timestamp: Date.now() - 86400000 * 1, status: 'confirmed' },
    { id: 'TS009', initiatorId: 'T007', receiverId: 'T008', initiatorGives: ['marzo-2'], receiverGives: ['abril-1'], timestamp: Date.now() - 86400000 * 2, status: 'confirmed' },
    { id: 'TS010', initiatorId: 'C007', receiverId: 'C004', initiatorGives: ['julio-2'], receiverGives: ['mayo-2'], timestamp: Date.now() - 86400000 * 9, status: 'confirmed' },
    // Casos de fracaso (10)
    { id: 'TF001', initiatorId: 'C001', receiverId: 'C003', initiatorGives: ['agosto-2'], receiverGives: ['septiembre-1'], timestamp: Date.now() - 86400000 * 4, status: 'rejected' },
    { id: 'TF002', initiatorId: 'T001', receiverId: 'T002', initiatorGives: ['septiembre-2'], receiverGives: ['mayo-1'], timestamp: Date.now() - 86400000 * 11, status: 'expired' },
    { id: 'TF003', initiatorId: 'C004', receiverId: 'C006', initiatorGives: ['octubre-1'], receiverGives: ['febrero-1'], timestamp: Date.now() - 86400000 * 6, status: 'rejected' },
    { id: 'TF004', initiatorId: 'C005', receiverId: 'C002', initiatorGives: ['diciembre-1'], receiverGives: ['junio-1'], timestamp: Date.now() - 86400000 * 14, status: 'expired' },
    { id: 'TF005', initiatorId: 'T005', receiverId: 'T001', initiatorGives: ['junio-2'], receiverGives: ['septiembre-2'], timestamp: Date.now() - 86400000 * 18, status: 'rejected' },
    { id: 'TF006', initiatorId: 'T006', receiverId: 'T002', initiatorGives: ['enero-2'], receiverGives: ['diciembre-2'], timestamp: Date.now() - 86400000 * 2, status: 'expired' },
    { id: 'TF007', initiatorId: 'C008', receiverId: 'C006', initiatorGives: ['marzo-1'], receiverGives: ['febrero-1'], timestamp: Date.now() - 86400000 * 7, status: 'rejected' },
    { id: 'TF008', initiatorId: 'C003', receiverId: 'C001', initiatorGives: ['diciembre-1'], receiverGives: ['enero-1'], timestamp: Date.now() - 86400000 * 3, status: 'expired' },
    { id: 'TF009', initiatorId: 'T001', receiverId: 'T005', initiatorGives: ['octubre-1'], receiverGives: ['junio-2'], timestamp: Date.now() - 86400000 * 22, status: 'rejected' },
    { id: 'TF010', initiatorId: 'C002', receiverId: 'C003', initiatorGives: ['agosto-1'], receiverGives: ['junio-2'], timestamp: Date.now() - 86400000 * 1, status: 'expired' },
];

const baseAllRequestsEverForDemo: Omit<SwapRequest, 'email' | 'whatsapp'>[] = [
    ...baseRequests,
    { id: 'C001', employeeId: 'C001', employeeName: 'Ana García', employeeType: 'Conductor', has: ['julio-1', 'agosto-2'], wants: ['enero-1', 'diciembre-2'] },
    { id: 'C002', employeeId: 'C002', employeeName: 'Carlos Rodriguez', employeeType: 'Conductor', has: ['enero-1', 'junio-1'], wants: ['julio-1', 'agosto-1'] },
    { id: 'C004', employeeId: 'C004', employeeName: 'Javier Moreno', employeeType: 'Conductor', has: ['mayo-2', 'octubre-1'], wants: ['julio-2', 'septiembre-2'] },
    { id: 'C007', employeeId: 'C007', employeeName: 'Isabel Alonso', employeeType: 'Conductor', has: ['julio-2'], wants: ['mayo-2'] },
    { id: 'T003', employeeId: 'T003', employeeName: 'Laura González', employeeType: 'Taller', has: ['julio-1'], wants: ['agosto-2'] },
    { id: 'T004', employeeId: 'T004', employeeName: 'Pablo Pérez', employeeType: 'Taller', has: ['agosto-2'], wants: ['julio-1'] },
    { id: 'T007', employeeId: 'T007', employeeName: 'Paula Díaz', employeeType: 'Taller', has: ['marzo-2'], wants: ['abril-1'] },
    { id: 'T008', employeeId: 'T008', employeeName: 'Sergio Gil', employeeType: 'Taller', has: ['abril-1'], wants: ['marzo-2'] },
    { ...newUser },
    // Add users involved in successful transactions to the "all time" list for history purposes
    { id: 'C009', employeeId: 'C009', employeeName: 'Pedro Martín', employeeType: 'Conductor', has: [], wants: [] },
    { id: 'C010', employeeId: 'C010', employeeName: 'Sara Torres', employeeType: 'Conductor', has: [], wants: [] },
    { id: 'C011', employeeId: 'C011', employeeName: 'Jorge Romero', employeeType: 'Conductor', has: [], wants: [] },
    { id: 'C012', employeeId: 'C012', employeeName: 'Eva Castro', employeeType: 'Conductor', has: [], wants: [] },
    { id: 'T009', employeeId: 'T009', employeeName: 'Raquel Ortega', employeeType: 'Taller', has: [], wants: [] },
    { id: 'T010', employeeId: 'T010', employeeName: 'Fernando Soto', employeeType: 'Taller', has: [], wants: [] },
    { id: 'C013', employeeId: 'C013', employeeName: 'Beatriz Reyes', employeeType: 'Conductor', has: [], wants: [] },
    { id: 'C014', employeeId: 'C014', employeeName: 'Óscar Vega', employeeType: 'Conductor', has: [], wants: [] },
    { id: 'T011', employeeId: 'T011', employeeName: 'Marta Rubio', employeeType: 'Taller', has: [], wants: [] },
    { id: 'T012', employeeId: 'T012', employeeName: 'Manuel Marín', employeeType: 'Taller', has: [], wants: [] },
    { id: 'C015', employeeId: 'C015', employeeName: 'Silvia Ibáñez', employeeType: 'Conductor', has: [], wants: [] },
    { id: 'C016', employeeId: 'C016', employeeName: 'Roberto Pascual', employeeType: 'Conductor', has: [], wants: [] },
];

export const allRequestsEverForDemo: SwapRequest[] = baseAllRequestsEverForDemo.map(req => ({ ...req, ...updatedContactInfo }));

// FIX: Added missing demo data for Rest Swap App
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);
const lastWeek = new Date(today);
lastWeek.setDate(today.getDate() - 7);

const toYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];

export const initialRestRequests: RestSwapRequest[] = [
    // Active requests
    {
        id: 'rest-1',
        employeeId: 'C001',
        employeeName: 'Ana García (Conductor)',
        employeeType: 'Conductor',
        offeredDays: [toYYYYMMDD(tomorrow), toYYYYMMDD(nextWeek)],
        reason: 'Necesito cambiar uno de mis descansos por un asunto familiar urgente. Ofrezco dos fechas alternativas.',
        createdAt: Date.now() - 86400000 * 1, // 1 day ago
        status: 'active',
    },
    {
        id: 'rest-2',
        employeeId: 'T001',
        employeeName: 'Sofía Martínez (Taller)',
        employeeType: 'Taller',
        offeredDays: [toYYYYMMDD(new Date(today.getFullYear(), today.getMonth() + 1, 5))],
        reason: 'Tengo una cita médica a la que no puedo faltar. Ofrezco mi descanso del próximo mes.',
        createdAt: Date.now() - 86400000 * 2, // 2 days ago
        status: 'active',
    },
    // Successful requests
    {
        id: 'rest-3',
        employeeId: 'C002',
        employeeName: 'Carlos Rodriguez (Conductor)',
        employeeType: 'Conductor',
        offeredDays: [`${today.getFullYear()}-06-15`],
        reason: 'Cambiado con éxito para poder asistir a una boda.',
        createdAt: Date.now() - 86400000 * 10, // 10 days ago
        status: 'successful',
    },
    {
        id: 'rest-4',
        employeeId: 'T002',
        employeeName: 'David López (Taller)',
        employeeType: 'Taller',
        offeredDays: [`${today.getFullYear()}-05-20`],
        reason: 'Conseguí el cambio para unas mini-vacaciones. ¡Gracias!',
        createdAt: Date.now() - 86400000 * 35, // 35 days ago
        status: 'successful',
    },
    // Expired requests
    {
        id: 'rest-5',
        employeeId: 'C003',
        employeeName: 'Lucía Fernández (Conductor)',
        employeeType: 'Conductor',
        offeredDays: [toYYYYMMDD(lastWeek), toYYYYMMDD(yesterday)],
        reason: 'Ofrecía estos días la semana pasada pero ya no me es necesario el cambio.',
        createdAt: Date.now() - 86400000 * 8, // 8 days ago
        status: 'active', // The app logic will change this to expired
    },
];

export const initialDebts: Debt[] = [
    {
        id: 'debt-1',
        debtorId: '3728', // José Luis Bellot Gamez
        debtorName: 'José Luis Bellot Gamez',
        creditorId: 'C001',
        creditorName: 'Ana García',
        originalRequestId: 'rest-sim-1',
        createdAt: Date.now() - 86400000 * 5, // 5 days ago
    },
    {
        id: 'debt-2',
        debtorId: 'T002',
        debtorName: 'David López',
        creditorId: '3728', // José Luis Bellot Gamez
        creditorName: 'José Luis Bellot Gamez',
        originalRequestId: 'rest-sim-2',
        createdAt: Date.now() - 86400000 * 12, // 12 days ago
    },
];