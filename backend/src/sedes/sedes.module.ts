import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InstitucionesModule } from '../instituciones/instituciones.module';
import { SedesService } from './sedes.service';
import { SedesController } from './sedes.controller';

@Module({
  controllers: [SedesController],
  providers: [SedesService],
  imports: [AuthModule, InstitucionesModule],
  exports: [SedesService],
})
export class SedesModule {}