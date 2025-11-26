import { Module } from '@nestjs/common';
import { TutorAulaService } from './tutor-aula.service';
import { TutorAulaController } from './tutor-aula.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [TutorAulaController],
  providers: [TutorAulaService],
  imports: [AuthModule],
  exports: [TutorAulaService],
})
export class TutorAulaModule {}