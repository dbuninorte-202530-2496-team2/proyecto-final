import { Module } from '@nestjs/common';
import { ComponentesService } from './componentes.service';
import { ComponentesController } from './componentes.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [ComponentesController],
    providers: [ComponentesService],
    exports: [ComponentesService],
})
export class ComponentesModule { }
