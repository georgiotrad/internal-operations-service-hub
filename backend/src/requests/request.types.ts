export type RequestStatus = 'SUBMITTED' | 'IN_PROGRESS' | 'COMPLETED';
export type LocalRole = 'EMPLOYEE' | 'IT_STAFF';

export interface ServiceRequest {
  id: string;
  requesterId: string;
  department: 'IT';
  category: string;
  description: string;
  status: RequestStatus;
  updatedAt: string;
}

export interface LocalIdentity {
  userId: string;
  role: LocalRole;
}
