import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { HorarioService } from './horario.service';
import { HorarioController } from './horario.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [DatabaseModule, AuthModule],
    controllers: [HorarioController],
    providers: [HorarioService],
    exports: [HorarioService],
})
export class HorarioModule { }
