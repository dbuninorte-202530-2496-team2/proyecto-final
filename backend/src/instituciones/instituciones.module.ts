import { Module } from '@nestjs/common';
import { InstitucionesController } from './instituciones.controller';
import { InstitucionesService } from './instituciones.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [InstitucionesController],
  providers: [InstitucionesService],
  imports: [AuthModule],
  exports: [InstitucionesService],
})
export class InstitucionesModule {}