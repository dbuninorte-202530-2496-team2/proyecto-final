import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { TipoDocumentoService } from './tipo-documento.service';
import { TipoDocumentoController } from './tipo-documento.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [TipoDocumentoController],
  providers: [TipoDocumentoService],
  exports: [TipoDocumentoService],
})
export class TipoDocumentoModule { }
