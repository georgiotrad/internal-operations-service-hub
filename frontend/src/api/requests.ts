export type RequestStatus =
  | 'SUBMITTED'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export type LocalRole = 'EMPLOYEE' | 'IT_STAFF';

export interface LocalIdentity {
  userId: string;
  role: LocalRole;
  label: string;
}

export interface ServiceRequest {
  id: string;
  requesterId: string;
  department: 'IT';
  category: string;
  description: string;
  status: RequestStatus;
  updatedAt: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:3000';

function identityHeaders(
  identity: LocalIdentity,
): HeadersInit {
  return {
    'x-user-id': identity.userId,
    'x-role': identity.role,
  };
}

async function readOrThrow(
  response: Response,
): Promise<ServiceRequest> {
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      body?.message ??
        'Operations Hub could not complete the request.',
    );
  }

  return body;
}

export async function fetchRequest(
  id: string,
  identity: LocalIdentity,
): Promise<ServiceRequest> {
  const response = await fetch(
    `${API_BASE_URL}/api/requests/${id}`,
    {
      headers: identityHeaders(identity),
    },
  );

  return readOrThrow(response);
}

export async function updateRequestStatus(
  id: string,
  status: RequestStatus,
  identity: LocalIdentity,
): Promise<ServiceRequest> {
  const response = await fetch(
    `${API_BASE_URL}/api/requests/${id}/status`,
    {
      method: 'PATCH',
      headers: {
        ...identityHeaders(identity),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    },
  );

  return readOrThrow(response);
}