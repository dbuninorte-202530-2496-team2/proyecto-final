import { Module } from '@nestjs/common';
import { InstitucionesController } from './instituciones.controller';
import { InstitucionesService } from './instituciones.service';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  controllers: [InstitucionesController],
  providers: [InstitucionesService],
  imports: [DatabaseModule, AuthModule],
  exports: [InstitucionesService],
})
export class InstitucionesModule { }