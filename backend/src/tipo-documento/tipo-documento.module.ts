import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { TipoDocumentoService } from './tipo-documento.service';
import { TipoDocumentoController } from './tipo-documento.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [TipoDocumentoController],
  providers: [TipoDocumentoService],
  exports: [TipoDocumentoService],
})
export class TipoDocumentoModule { }
