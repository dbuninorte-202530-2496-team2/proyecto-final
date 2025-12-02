import { Module } from '@nestjs/common';
import { PeriodosService } from './periodos.service';
import { PeriodosController } from './periodos.controller';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  controllers: [PeriodosController],
  providers: [PeriodosService],
  imports: [DatabaseModule, AuthModule],
  exports: [PeriodosService],
})
export class PeriodosModule { }