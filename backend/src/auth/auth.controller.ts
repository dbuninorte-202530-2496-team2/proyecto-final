// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginUsuarioDto } from './dto';
import { GetUser } from './decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginUsuarioDto) {
    return this.authService.login(loginDto.usuario, loginDto.contrasena);
  }

  @Get('check-status')
  @UseGuards(AuthGuard())  // ← Requiere estar autenticado
  checkAuthStatus(@GetUser() user) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('me')
  @UseGuards(AuthGuard())
  getProfile(@GetUser() user) {
    return user;  // retorna los datos del usuario actual
  }
}