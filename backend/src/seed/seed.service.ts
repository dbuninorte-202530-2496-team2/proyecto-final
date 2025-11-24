import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedService {
  constructor(@Inject(PG_CONNECTION) private readonly pool: Pool) {}

  async executeSeed() {
    const client = await this.pool.connect();
    
    try {
      // Leer el archivo seed.sql
      const sqlPath = path.join(__dirname, '../../sql/seed/seed.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');

      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');

      return { 
        message: 'Seed ejecutado exitosamente',
        file: 'sql/seed/seed.sql'
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}