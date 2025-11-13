export type FortnightId = string;

export interface SwapRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeType: 'Conductor' | 'Taller';
  email: string;
  whatsapp: string;
  has: FortnightId[];
  wants: FortnightId[];
}

export interface TradeProposal {
  give: FortnightId;
  get: FortnightId;
}

export interface Match {
  otherPerson: SwapRequest;
  proposals: TradeProposal[];
}

export type TransactionStatus = 'pending' | 'confirmed' | 'rejected' | 'expired';

export interface Transaction {
  id: string;
  initiatorId: string; // The user who clicked "Select"
  receiverId: string;  // The other person in the match
  initiatorGives: FortnightId[]; // What the initiator offers
  receiverGives: FortnightId[]; // What the receiver offers (what the initiator gets)
  timestamp: number;   // When the selection was made
  status: TransactionStatus;
}

// FIX: Added missing type definitions for other app features.
export interface RestSwapRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeType: 'Conductor' | 'Taller';
  offeredDays: string[]; // YYYY-MM-DD format
  reason: string;
  createdAt: number;
  status: 'active' | 'successful' | 'expired';
}

export interface Debt {
  id: string;
  debtorId: string;
  debtorName: string;
  creditorId: string;
  creditorName: string;
  originalRequestId: string;
  createdAt: number;
}

export interface Announcement {
  id: string;
  author: string;
  title: string;
  content: string;
  createdAt: number;
}
