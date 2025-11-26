import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';

import { Pool } from 'pg';
import { PG_CONNECTION } from '../database/database.module';

import { CreatePersonalDto } from './dto/create-personal.dto';
import { UpdatePersonalDto } from './dto/update-personal.dto';

@Injectable()
export class PersonalService {
    constructor(@Inject(PG_CONNECTION) private readonly pool: Pool) { }

    async create(dto: CreatePersonalDto) {
        const { codigo, nombre, apellido, correo, telefono, id_rol, usuario, tipo_doc } = dto;

        try {
            const result = await this.pool.query(
                `INSERT INTO personal
          (codigo, nombre, apellido, correo, telefono, id_rol, usuario, tipo_doc)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING id, codigo, nombre, apellido, correo, telefono, id_rol, usuario, tipo_doc`,
                [codigo, nombre, apellido || null, correo || null, telefono || null, id_rol, usuario || null, tipo_doc],
            );
            return result.rows[0];
        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    async findAll() {
        try {
            const result = await this.pool.query(
                `SELECT id, codigo, nombre, apellido, correo, telefono, id_rol, usuario, tipo_doc
         FROM personal ORDER BY id ASC`,
            );
            return result.rows;
        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    async findOne(id: number) {
        try {
            const result = await this.pool.query(
                `SELECT id, codigo, nombre, apellido, correo, telefono, id_rol, usuario, tipo_doc
         FROM personal WHERE id = $1`,
                [id],
            );

            if (result.rows.length === 0)
                throw new NotFoundException(`Personal con id ${id} no encontrado`);

            return result.rows[0];
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.handleDBExceptions(error);
        }
    }

    async update(id: number, dto: UpdatePersonalDto) {
        const { codigo, nombre, apellido, correo, telefono, id_rol, usuario, tipo_doc } = dto;

        try {
            await this.findOne(id);

            const result = await this.pool.query(
                `UPDATE personal SET
           codigo = COALESCE($1, codigo),
           nombre = COALESCE($2, nombre),
           apellido = COALESCE($3, apellido),
           correo = COALESCE($4, correo),
           telefono = COALESCE($5, telefono),
           id_rol = COALESCE($6, id_rol),
           usuario = COALESCE($7, usuario),
           tipo_doc = COALESCE($8, tipo_doc)
         WHERE id = $9
         RETURNING id, codigo, nombre, apellido, correo, telefono, id_rol, usuario, tipo_doc`,
                [codigo, nombre, apellido, correo, telefono, id_rol, usuario, tipo_doc, id],
            );

            return result.rows[0];
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.handleDBExceptions(error);
        }
    }

    async remove(id: number) {
        try {
            await this.findOne(id);
            await this.pool.query(`DELETE FROM personal WHERE id = $1`, [id]);
            return { message: `Personal con id ${id} eliminado correctamente` };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.handleDBExceptions(error);
        }
    }

    async findTutores() {
        try {
            const result = await this.pool.query(
                `SELECT p.id, p.codigo, p.nombre, p.apellido, p.correo, p.telefono,
                p.id_rol, p.usuario, p.tipo_doc
         FROM personal p
         JOIN rol r ON r.id = p.id_rol
         WHERE LOWER(TRIM(r.nombre)) = 'tutor'
         ORDER BY p.id ASC`,
            );
            return result.rows;
        } catch (error) {
            this.handleDBExceptions(error);
        }
    }

    private handleDBExceptions(error: any): never {
        console.error(error);

        if (error.code === '23505')
            throw new BadRequestException('Dato duplicado o usuario ya existe');

        if (error.code === '23503')
            throw new BadRequestException('Referencia inválida en llaves foráneas');

        throw new InternalServerErrorException('Error inesperado en el servidor');
    }
}
