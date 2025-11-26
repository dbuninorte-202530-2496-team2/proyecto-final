import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SeedModule } from './seed/seed.module';
import { RolesModule } from './roles/roles.module';

import { EstudiantesModule } from './estudiantes/estudiantes.module';
import { EstudianteAulaModule } from './estudiante-aula/estudiante-aula.module';
import { AsistenciaEstudiantesModule } from './asistencia-estudiantes/asistencia-estudiantes.module';

@Module({
  imports: [

    ConfigModule.forRoot(),

    DatabaseModule,

    SeedModule,
    
    AuthModule,
    
    RolesModule,

    EstudiantesModule,

    EstudianteAulaModule,
    
    AsistenciaEstudiantesModule,

  ],
})
export class AppModule {}
