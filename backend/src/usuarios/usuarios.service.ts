import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';

import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';

import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
    constructor(@Inject(PG_CONNECTION) private readonly pool: Pool) { }

    async create(dto: CreateUsuarioDto) {
        const { usuario, contrasena } = dto;

        try {
            const result = await this.pool.query(
                `INSERT INTO usuario (usuario, contrasena)
         VALUES ($1, $2)
         RETURNING usuario, contrasena`,
                [usuario, contrasena],
            );
            return result.rows[0];
        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    async findAll() {
        try {
            const result = await this.pool.query(
                `SELECT usuario, contrasena FROM usuario ORDER BY usuario ASC`,
            );
            return result.rows;
        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    async findOne(usuario: string) {
        try {
            const result = await this.pool.query(
                `SELECT usuario, contrasena FROM usuario WHERE usuario = $1`,
                [usuario],
            );

            if (result.rows.length === 0)
                throw new NotFoundException(`Usuario '${usuario}' no encontrado`);

            return result.rows[0];
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.handleDBExceptions(error);
        }
    }

    async update(usuario: string, dto: UpdateUsuarioDto) {
        const { contrasena } = dto;

        try {
            await this.findOne(usuario);

            const result = await this.pool.query(
                `UPDATE usuario
         SET contrasena = COALESCE($1, contrasena)
         WHERE usuario = $2
         RETURNING usuario, contrasena`,
                [contrasena, usuario],
            );

            return result.rows[0];
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.handleDBExceptions(error);
        }
    }

    async remove(usuario: string) {
        try {
            await this.findOne(usuario);

            await this.pool.query(`DELETE FROM usuario WHERE usuario = $1`, [
                usuario,
            ]);

            return { message: `Usuario '${usuario}' eliminado correctamente` };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.handleDBExceptions(error);
        }
    }

    async sendPassword(usuario: string) {
        await this.findOne(usuario);
        return {
            message: `Contraseña enviada al correo del usuario '${usuario}' (simulado)`,
        };
    }

    private handleDBExceptions(error: any): never {
        console.error(error);

        if (error.code === '23505')
            throw new BadRequestException('El usuario ya existe');

        throw new InternalServerErrorException('Error inesperado');
    }
}
