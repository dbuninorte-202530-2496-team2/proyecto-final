import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MotivoService } from './motivo.service';
import { MotivoController } from './motivo.controller';

@Module({
    imports: [DatabaseModule],
    controllers: [MotivoController],
    providers: [MotivoService],
    exports: [MotivoService],
})
export class MotivoModule { }
