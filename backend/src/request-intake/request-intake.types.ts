export const ALLOWED_DEPARTMENTS = [
  'IT',
  'HR',
  'FINANCE',
] as const;

export type IntakeDepartment =
  (typeof ALLOWED_DEPARTMENTS)[number];

export const ALLOWED_CATEGORIES = {
  IT: [
    'Laptop Support',
    'Account Support',
    'Network Support',
    'Software Support',
  ],
  HR: [
    'Leave Request',
    'Benefits',
    'Employee Records',
  ],
  FINANCE: [
    'Expense',
    'Invoice',
    'Payroll',
  ],
} as const;

export type IntakeCategory =
  | (typeof ALLOWED_CATEGORIES.IT)[number]
  | (typeof ALLOWED_CATEGORIES.HR)[number]
  | (typeof ALLOWED_CATEGORIES.FINANCE)[number];

export interface RequestIntakeInput {
  text: string;
}

export interface AiIntakeCandidate {
  department: string;
  category: string;
  description: string;
  needsClarification: boolean;
  clarificationQuestion: string | null;
}

export interface ValidatedIntakeCandidate {
  department: IntakeDepartment;
  category: IntakeCategory;
  description: string;
  needsClarification: boolean;
  clarificationQuestion: string | null;
}