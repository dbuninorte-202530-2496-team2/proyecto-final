import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MotivoService } from './motivo.service';
import { MotivoController } from './motivo.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [DatabaseModule, AuthModule],
    controllers: [MotivoController],
    providers: [MotivoService],
    exports: [MotivoService],
})
export class MotivoModule { }
