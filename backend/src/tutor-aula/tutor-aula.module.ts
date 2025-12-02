import { Module } from '@nestjs/common';
import { TutorAulaService } from './tutor-aula.service';
import { TutorAulaController } from './tutor-aula.controller';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  controllers: [TutorAulaController],
  providers: [TutorAulaService],
  imports: [DatabaseModule, AuthModule],
  exports: [TutorAulaService],
})
export class TutorAulaModule { }