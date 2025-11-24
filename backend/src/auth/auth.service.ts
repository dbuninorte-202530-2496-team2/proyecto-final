// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { PG_CONNECTION } from '../database/database.module';
import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    @Inject(PG_CONNECTION) private readonly pool: Pool,
    private readonly jwtService: JwtService,
  ) {}

  async login(usuario: string, contrasena: string) {
    const result = await this.pool.query(
      `SELECT p.id, p.usuario, u.contrasena, r.nombre as rol
       FROM personal p
       INNER JOIN usuario u ON p.usuario = u.usuario
       INNER JOIN rol r ON p.id_rol = r.id
       WHERE p.usuario = $1`,
      [usuario]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const user = result.rows[0];

    const isValid = await bcrypt.compare(contrasena, user.contrasena);
    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      ...user,
      token: this.getJwtToken({ id: user.id, usuario: user.usuario, rol: user.rol })
    };
  }

  async checkAuthStatus(user: any) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id, usuario: user.usuario, rol: user.rol })
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}