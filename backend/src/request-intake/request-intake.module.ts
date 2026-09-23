import { Module } from '@nestjs/common';
import { RequestIntakeController } from './request-intake.controller';
import { RequestIntakeProvider } from './request-intake.provider';
import { RequestIntakeService } from './request-intake.service';

@Module({
  controllers: [RequestIntakeController],
  providers: [
    RequestIntakeProvider,
    RequestIntakeService,
  ],
  exports: [RequestIntakeService],
})
export class RequestIntakeModule {}