import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { LocalIdentity, LocalRole, RequestStatus } from './request.types';

@Controller('api/requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get(':id')
  getRequest(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string | undefined,
    @Headers('x-role') role: string | undefined,
  ) {
    return this.requestsService.getById(
      id,
      this.identity(userId, role),
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status?: RequestStatus },
    @Headers('x-user-id') userId: string | undefined,
    @Headers('x-role') role: string | undefined,
  ) {
    if (!body.status) {
      throw new BadRequestException(
        'A target status is required.',
      );
    }

    return this.requestsService.updateStatus(
      id,
      body.status,
      this.identity(userId, role),
    );
  }

  private identity(
    userId?: string,
    role?: string,
  ): LocalIdentity {
    if (
      !userId ||
      (role !== 'EMPLOYEE' && role !== 'IT_STAFF')
    ) {
      throw new BadRequestException(
        'Local development identity headers x-user-id and x-role are required.',
      );
    }

    return {
      userId,
      role: role as LocalRole,
    };
  }
}