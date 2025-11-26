import { Module } from '@nestjs/common';
import { AsistenciaEstudiantesService } from './asistencia-estudiantes.service';
import { AsistenciaEstudiantesController } from './asistencia-estudiantes.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AsistenciaEstudiantesController],
  providers: [AsistenciaEstudiantesService],  
})
export class AsistenciaEstudiantesModule {}
