import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [AuthModule],
  exports: [RolesService],
})
export class RolesModule { }