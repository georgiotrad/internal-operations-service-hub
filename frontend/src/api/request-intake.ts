export interface IntakeCandidate {
  department: 'IT' | 'HR' | 'FINANCE';
  category: string;
  description: string;
  needsClarification: boolean;
  clarificationQuestion: string | null;
}

export async function assistRequestIntake(
  text: string,
): Promise<IntakeCandidate> {
  const response = await fetch(
    'http://localhost:3000/api/request-intake/assist',
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
