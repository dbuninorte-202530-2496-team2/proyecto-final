import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SeedModule } from './seed/seed.module';
import { RolesModule } from './roles/roles.module';
import { InstitucionesModule } from './instituciones/instituciones.module';
import { SedesModule } from './sedes/sedes.module';
import { AulasModule } from './aulas/aulas.module';

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
  ],
})
export class AppModule {}
