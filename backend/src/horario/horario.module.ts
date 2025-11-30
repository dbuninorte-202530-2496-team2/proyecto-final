import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { HorarioService } from './horario.service';
import { HorarioController } from './horario.controller';

@Module({
    imports: [DatabaseModule],
    controllers: [HorarioController],
    providers: [HorarioService],
    exports: [HorarioService],
})
export class HorarioModule { }
