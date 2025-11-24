import { Module } from '@nestjs/common';
import { PersonalService } from './personal.service';
import { PersonalController } from './personal.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [PersonalController],
    providers: [PersonalService],
    exports: [PersonalService],
})
export class PersonalModule { }
