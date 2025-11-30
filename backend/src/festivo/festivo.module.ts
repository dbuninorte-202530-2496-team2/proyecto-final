import { Module } from '@nestjs/common';
import { FestivoService } from './festivo.service';
import { FestivoController } from './festivo.controller';

@Module({
    controllers: [FestivoController],
    providers: [FestivoService],
})
export class FestivoModule { }
