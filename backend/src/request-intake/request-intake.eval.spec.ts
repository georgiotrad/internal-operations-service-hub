import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { RequestIntakeProvider } from './request-intake.provider';
import { RequestIntakeService } from './request-intake.service';

describe('AI-assisted Request Intake evaluations', () => {
  let provider: RequestIntakeProvider;
  let service: RequestIntakeService;

  beforeEach(() => {
    provider = new RequestIntakeProvider();
    service = new RequestIntakeService(provider);
  });

  it('classifies a clear laptop Wi-Fi problem', async () => {
    const result = await service.assist({
      text: 'My laptop cannot connect to the office Wi-Fi.',
    });

    expect(result.department).toBe('IT');
    expect(result.category).toBe('Laptop Support');
    expect(result.needsClarification).toBe(false);
  });

  it('classifies an account problem and requests clarification', async () => {
    const result = await service.assist({
      text: 'I need help with my account.',
    });

    expect(result.department).toBe('IT');
    expect(result.category).toBe('Account Support');
    expect(result.needsClarification).toBe(true);
    expect(result.clarificationQuestion).not.toBeNull();
  });

  it('classifies a leave request as HR', async () => {
    const result = await service.assist({
      text: 'I need to request vacation leave next week.',
    });

    expect(result.department).toBe('HR');
    expect(result.category).toBe('Leave Request');
    expect(result.needsClarification).toBe(false);
  });

  it('classifies an expense reimbursement as Finance', async () => {
    const result = await service.assist({
      text: 'I need reimbursement for a travel expense.',
    });

    expect(result.department).toBe('FINANCE');
    expect(result.category).toBe('Expense');
    expect(result.needsClarification).toBe(false);
  });

  it('handles thin ambiguous input by asking for clarification', async () => {
    const result = await service.assist({
      text: 'I need help.',
    });

    expect(result.needsClarification).toBe(true);
    expect(result.clarificationQuestion).toBe(
      'Please provide more information about the support you need.',
    );
  });

  it('rejects empty employee input', async () => {
    await expect(
      service.assist({
        text: '   ',
      }),
    ).rejects.toThrow('Request text is required.');
  });

  it('rejects invalid AI output outside the trusted product context', async () => {
    jest.spyOn(provider, 'generate').mockResolvedValue({
      department: 'LEGAL',
      category: 'Contract Review',
      description: 'Please review my contract.',
      needsClarification: false,
      clarificationQuestion: null,
    });

    await expect(
      service.assist({
        text: 'Please review my contract.',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('handles AI provider failure safely', async () => {
    jest
      .spyOn(provider, 'generate')
      .mockRejectedValue(new Error('Provider unavailable'));

    await expect(
      service.assist({
        text: 'My laptop is broken.',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});