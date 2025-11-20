
export type FortnightId = string;

export interface Administrator {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  role: 'master' | 'delegate';
}

export interface SwapRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeType: 'Conductor' | 'Taller';
  email: string;
  whatsapp: string;
  has: FortnightId[];
  wants: FortnightId[];
  status: 'active' | 'blocked';
  blockReason?: string;
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
  formalized?: boolean; // New field to track if the paperwork/final check is done
}

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

export type AnnouncementCategory = 'mercadillo' | 'objetos_perdidos' | 'avisos_generales';

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: number;
}

export interface Announcement {
  id: string;
  authorId: string;
  author: string;
  title: string;
  content: string;
  createdAt: number;
  expiresAt: number;
  category: AnnouncementCategory;
  includeContact: boolean;
  comments: Comment[];
  status: 'active' | 'archived';
  archiveReason?: 'success' | 'no_reason' | 'expired';
  renewalCount?: number;
}

// FIX: Added initialAssignment to track what the company originally gave the employee
export interface RegisteredUser extends Omit<SwapRequest, 'id' | 'has' | 'wants' | 'status' | 'blockReason'> {
    initialAssignment: FortnightId[];
    password?: string; // Added password field (optional for legacy data compatibility, mandatory for new)
}