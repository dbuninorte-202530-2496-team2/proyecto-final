import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SeedModule } from './seed/seed.module';
import { RolesModule } from './roles/roles.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PersonalModule } from './personal/personal.module';
import { HorarioModule } from './horario/horario.module';
import { MotivoModule } from './motivo/motivo.module';
import { FestivoModule } from './festivo/festivo.module';

@Module({
  imports: [

    ConfigModule.forRoot(),

    DatabaseModule,

    SeedModule,

    AuthModule,

    RolesModule,

    UsuariosModule,

    PersonalModule,

    HorarioModule,

    MotivoModule,

    FestivoModule,

  ],
})
export class AppModule { }
