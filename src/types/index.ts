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
  status: 'storage' | 'with-employee';
  location: {
    mainBox: number;
    subBox: string; // 'a' through 'i'
  };
  currentHolderId?: string; // This is the Firestore document ID of the user
}

export interface AuditLog {
  id: string;
  timestamp: string; // ISO string
  userId: string;
  userName: string;
  action: 'TAKE' | 'RETURN' | 'ADD_DSC' | 'UPDATE_DSC' | 'DELETE_DSC';
  dscSerialNumber: string;
  dscDescription: string;
}
