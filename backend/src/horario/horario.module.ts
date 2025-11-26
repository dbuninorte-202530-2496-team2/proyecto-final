import { Module } from '@nestjs/common';
import { HorarioService } from './horario.service';
import { HorarioController } from './horario.controller';

@Module({
    controllers: [HorarioController],
    providers: [HorarioService],
})
export class HorarioModule { }
