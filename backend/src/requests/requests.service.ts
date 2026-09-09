import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LocalIdentity, RequestStatus, ServiceRequest } from './request.types';
import { RequestsRepository } from './requests.repository';

@Injectable()
export class RequestsService {
  constructor(private readonly repository: RequestsRepository) {}

  async getById(id: string, identity: LocalIdentity): Promise<ServiceRequest> {
    const request = await this.mustFind(id);

    const canView =
      identity.userId === request.requesterId ||
      (identity.role === 'IT_STAFF' && request.department === 'IT');

    if (!canView) {
      throw new ForbiddenException('You are not authorized to view this request.');
    }

    return request;
  }

  async updateStatus(
    id: string,
    requestedStatus: RequestStatus,
    identity: LocalIdentity,
  ): Promise<ServiceRequest> {
    const request = await this.mustFind(id);

    if (identity.role !== 'IT_STAFF' || request.department !== 'IT') {
      throw new ForbiddenException(
        'Only authorized IT staff may change this request status.',
      );
    }

    if (request.status === 'SUBMITTED' && requestedStatus === 'IN_PROGRESS') {
      const updated: ServiceRequest = {
        ...request,
        status: 'IN_PROGRESS',
        updatedAt: new Date().toISOString(),
      };
      return this.repository.save(updated);
    }

    if (request.status === 'IN_PROGRESS' && requestedStatus === 'COMPLETED') {
      const updated: ServiceRequest = {
        ...request,
        status: 'COMPLETED',
        updatedAt: new Date().toISOString(),
      };
      return this.repository.save(updated);
    }

    throw new BadRequestException(
      `Invalid transition from ${request.status} to ${requestedStatus}.`,
    );
  }

  private async mustFind(id: string): Promise<ServiceRequest> {
    const request = await this.repository.findById(id);
    if (!request) {
      throw new NotFoundException(`Request "${id}" was not found.`);
    }
    return request;
  }
}
