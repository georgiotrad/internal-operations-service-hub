import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsRepository } from './requests.repository';
import { ServiceRequest } from './request.types';

describe('RequestsService business rules', () => {
  let service: RequestsService;
  let repository: jest.Mocked<
    Pick<RequestsRepository, 'findById' | 'save'>
  >;

  const submittedRequest: ServiceRequest = {
    id: 'REQ-1001',
    requesterId: 'employee-001',
    department: 'IT',
    category: 'Laptop Support',
    description: 'Laptop cannot connect to the office Wi-Fi.',
    status: 'SUBMITTED',
    updatedAt: '2026-09-09T08:00:00.000Z',
  };

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    service = new RequestsService(
      repository as unknown as RequestsRepository,
    );
  });

  it('allows IT staff to move SUBMITTED to IN_PROGRESS', async () => {
    repository.findById.mockResolvedValue(submittedRequest);

    repository.save.mockImplementation(async (request) => request);

    const result = await service.updateStatus(
      'REQ-1001',
      'IN_PROGRESS',
      {
        userId: 'it-staff-001',
        role: 'IT_STAFF',
      },
    );

    expect(result.status).toBe('IN_PROGRESS');
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('denies an employee from changing request status', async () => {
    repository.findById.mockResolvedValue(submittedRequest);

    await expect(
      service.updateStatus(
        'REQ-1001',
        'IN_PROGRESS',
        {
          userId: 'employee-001',
          role: 'EMPLOYEE',
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('rejects an invalid lifecycle transition', async () => {
    const inProgressRequest: ServiceRequest = {
      ...submittedRequest,
      status: 'IN_PROGRESS',
    };

    repository.findById.mockResolvedValue(inProgressRequest);

    await expect(
      service.updateStatus(
        'REQ-1001',
        'SUBMITTED',
        {
          userId: 'it-staff-001',
          role: 'IT_STAFF',
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repository.save).not.toHaveBeenCalled();
  });
});