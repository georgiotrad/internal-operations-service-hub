import { Module } from '@nestjs/common';
import { RequestIntakeModule } from './request-intake/request-intake.module';
import { RequestsModule } from './requests/requests.module';

@Module({
  imports: [
    RequestsModule,
    RequestIntakeModule,
  ],
})
export class AppModule {}