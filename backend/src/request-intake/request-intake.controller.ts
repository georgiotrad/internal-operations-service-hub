import {
  BadRequestException,
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { RequestIntakeService } from './request-intake.service';
import { RequestIntakeInput } from './request-intake.types';

@Controller('api/request-intake')
export class RequestIntakeController {
  constructor(
    private readonly requestIntakeService: RequestIntakeService,
  ) {}

  @Post('assist')
  assist(@Body() body: RequestIntakeInput) {
    if (!body || typeof body.text !== 'string') {
      throw new BadRequestException(
        'Request text is required.',
      );
    }

    return this.requestIntakeService.assist(body);
  }
}