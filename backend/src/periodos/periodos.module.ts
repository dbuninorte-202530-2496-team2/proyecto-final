import { Module } from '@nestjs/common';
import { PeriodosService } from './periodos.service';
import { PeriodosController } from './periodos.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [PeriodosController],
  providers: [PeriodosService],
  imports: [AuthModule],
  exports: [PeriodosService],
})
export class PeriodosModule {}