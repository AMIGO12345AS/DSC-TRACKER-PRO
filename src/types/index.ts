export interface User {
  id: string; // This is the document ID from Firestore
  name: string;
  role: 'leader' | 'employee';
  hasDsc: boolean; // if they currently hold the DSC
  password?: string;
}

export interface DSC {
  id: string;
  serialNumber: string;
  description: string;
  expiryDate: string; // ISO string
  status: 'storage' | 'with-employee' | 'with-client';
  location: {
    mainBox: number;
    subBox: string; // 'a' through 'i'
  };
  currentHolderId?: string | null; // This is the Firestore document ID of the user
  clientName?: string | null;
  clientDetails?: string | null;
}

export type AuditLogAction = 'TAKE' | 'RETURN' | 'ADD_DSC' | 'UPDATE_DSC' | 'DELETE_DSC' | 'TAKE_CLIENT' | 'RETURN_CLIENT';

export interface AuditLog {
  id: string;
  timestamp: string; // ISO string
  userId: string;
  userName: string;
  action: AuditLogAction;
  dscSerialNumber: string;
  dscDescription: string;
  details?: string;
}
