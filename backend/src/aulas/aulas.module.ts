import { Module } from '@nestjs/common';
import { AulasController } from './aulas.controller';
import { AulasService } from './aulas.service';
import { AuthModule } from '../auth/auth.module';
import { SedesModule } from '../sedes/sedes.module';

@Module({
  controllers: [AulasController],
  providers: [AulasService],
  imports: [AuthModule, SedesModule],
  exports: [AulasService],
})
export class AulasModule {}