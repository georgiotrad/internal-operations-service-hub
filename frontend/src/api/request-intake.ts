export interface IntakeCandidate {
  department: 'IT' | 'HR' | 'FINANCE';
  category: string;
  description: string;
  needsClarification: boolean;
  clarificationQuestion: string | null;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:3000';

export async function assistRequestIntake(
  text: string,
): Promise<IntakeCandidate> {
  const response = await fetch(
    `${API_BASE_URL}/api/request-intake/assist`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    },
  );

  const body = await response.json();

  if (!response.ok) {
    throw new Error(
      body.message ?? 'AI-assisted intake failed.',
    );
  }

  return body as IntakeCandidate;
}