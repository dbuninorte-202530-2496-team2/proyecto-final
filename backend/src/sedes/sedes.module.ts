import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InstitucionesModule } from '../instituciones/instituciones.module';
import { SedesService } from './sedes.service';
import { SedesController } from './sedes.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  controllers: [SedesController],
  providers: [SedesService],
  imports: [DatabaseModule, AuthModule, InstitucionesModule],
  exports: [SedesService],
})
export class SedesModule { }