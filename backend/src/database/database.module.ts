import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

//Nombre para el Pool
export const PG_CONNECTION = 'PG_CONNECTION';

const databaseProvider = {
  provide: PG_CONNECTION,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new Pool({
      host: configService.get('DB_HOST'),
      port: configService.get<number>('DB_PORT'),
      database: configService.get('DB_NAME'),
      user: configService.get('DB_USER'),
      password: configService.get('DB_PASSWORD'),
    });
  },
};

@Global()
@Module({
  providers: [databaseProvider],
  imports: [ConfigModule],
  exports: [databaseProvider],
})
export class DatabaseModule {}