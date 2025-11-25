import { Module } from '@nestjs/common';
import { AulaHorarioSemanaService } from './aula-horario-semana.service';
import { AulaHorarioSemanaController } from './aula-horario-semana.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [AulaHorarioSemanaController],
  providers: [AulaHorarioSemanaService],
  imports: [AuthModule],
  exports: [AulaHorarioSemanaService],
})
export class AulaHorarioSemanaModule {}