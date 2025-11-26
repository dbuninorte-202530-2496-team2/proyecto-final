import { Module } from '@nestjs/common';
import { EstudianteAulaService } from './estudiante-aula.service';
import { EstudianteAulaController } from './estudiante-aula.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [DatabaseModule, AuthModule],  
  controllers: [EstudianteAulaController],
  providers: [EstudianteAulaService],
})
export class EstudianteAulaModule {}
