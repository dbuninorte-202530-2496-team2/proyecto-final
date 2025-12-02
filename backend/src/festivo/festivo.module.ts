import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { FestivoService } from './festivo.service';
import { FestivoController } from './festivo.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [DatabaseModule, AuthModule],
    controllers: [FestivoController],
    providers: [FestivoService],
    exports: [FestivoService],
})
export class FestivoModule { }
