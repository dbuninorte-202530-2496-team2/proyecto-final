import { Module } from '@nestjs/common';
import { AsistenciaTutorService } from './asistencia-tutor.service';
import { AsistenciaTutorController } from './asistencia-tutor.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [AsistenciaTutorController],
  providers: [AsistenciaTutorService],
  imports: [AuthModule],
  exports: [AsistenciaTutorService],
})
export class AsistenciaTutorModule {}