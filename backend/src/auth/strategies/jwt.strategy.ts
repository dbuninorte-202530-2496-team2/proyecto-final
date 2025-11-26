// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Pool } from "pg";
import { PG_CONNECTION } from "../../database/database.module";
import { JwtPayload } from "../interfaces";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool,
        configService: ConfigService
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate(payload: JwtPayload) {
        const { id } = payload;

        // Query para obtener el usuario y su rol
        const result = await this.pool.query(
            `SELECT p.id, p.usuario, p.nombre, p.apellido, p.correo, r.nombre as rol
             FROM personal p
             INNER JOIN rol r ON p.id_rol = r.id
             WHERE p.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            throw new UnauthorizedException('Token no válido');
        }

        const user = result.rows[0];

        return {
            id: user.id,
            usuario: user.usuario,
            nombre: user.nombre,
            apellido: user.apellido,
            correo: user.correo,
            rol: user.rol
        };
    }
}