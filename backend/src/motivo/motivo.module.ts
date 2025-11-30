import { Module } from '@nestjs/common';
import { MotivoService } from './motivo.service';
import { MotivoController } from './motivo.controller';

@Module({
    controllers: [MotivoController],
    providers: [MotivoService],
})
export class MotivoModule { }
