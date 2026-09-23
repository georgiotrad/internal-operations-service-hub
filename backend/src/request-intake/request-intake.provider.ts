import { Injectable } from '@nestjs/common';
import { AiIntakeCandidate } from './request-intake.types';

@Injectable()
export class RequestIntakeProvider {
  async generate(text: string): Promise<AiIntakeCandidate> {
    const normalized = text.toLowerCase();

    if (
      normalized.includes('laptop') ||
      normalized.includes('wi-fi') ||
      normalized.includes('wifi')
    ) {
      return {
        department: 'IT',
        category: 'Laptop Support',
        description: text,
        needsClarification: false,
        clarificationQuestion: null,
      };
    }

    if (
      normalized.includes('password') ||
      normalized.includes('account') ||
      normalized.includes('login')
    ) {
      return {
        department: 'IT',
        category: 'Account Support',
        description: text,
        needsClarification: true,
        clarificationQuestion:
          'What problem are you experiencing with your account?',
      };
    }

    if (
      normalized.includes('leave') ||
      normalized.includes('vacation')
    ) {
      return {
        department: 'HR',
        category: 'Leave Request',
        description: text,
        needsClarification: false,
        clarificationQuestion: null,
      };
    }

    if (
      normalized.includes('expense') ||
      normalized.includes('reimbursement')
    ) {
      return {
        department: 'FINANCE',
        category: 'Expense',
        description: text,
        needsClarification: false,
        clarificationQuestion: null,
      };
    }

    return {
      department: 'IT',
      category: 'Account Support',
      description: text,
      needsClarification: true,
      clarificationQuestion:
        'Please provide more information about the support you need.',
    };
  }
}