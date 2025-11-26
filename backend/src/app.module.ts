import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SeedModule } from './seed/seed.module';
import { RolesModule } from './roles/roles.module';
import { InstitucionesModule } from './instituciones/instituciones.module';
import { SedesModule } from './sedes/sedes.module';
import { AulasModule } from './aulas/aulas.module';
import { PeriodosModule } from './periodos/periodos.module';
import { AulaHorarioSemanaModule } from './aula-horario-semana/aula-horario-semana.module';
import { TutorAulaModule } from './tutor-aula/tutor-aula.module';
import { AsistenciaTutorModule } from './asistencia-tutor/asistencia-tutor.module';

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
    
    InstitucionesModule,

    SedesModule,

    AulasModule,

    PeriodosModule,

    AulaHorarioSemanaModule,

    TutorAulaModule,

    EstudiantesModule,

    EstudianteAulaModule,
    
    AsistenciaEstudiantesModule,

    AsistenciaTutorModule,
  ],
})
export class AppModule {}
