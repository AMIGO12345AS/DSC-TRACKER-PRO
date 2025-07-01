export interface User {
  id: string;
  name: string;
  role: 'leader' | 'employee';
  hasDsc: boolean; // if they currently hold the DSC
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
  currentHolderId?: string;
}
