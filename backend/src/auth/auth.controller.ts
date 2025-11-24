import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginUsuarioDto } from './dto';
import { GetUser } from './decorators/get-user.decorator';
import { Auth } from './decorators';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginUsuarioDto) {
    return this.authService.login(loginDto.usuario, loginDto.contrasena);
  }

  @Auth()
  @ApiOperation({ summary: 'Autenticar y renovar Token' })
  @Get('check-status')
  checkAuthStatus(@GetUser() user) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('me')
  @ApiOperation({ summary: 'información sobre usuario' })
  @UseGuards(AuthGuard())
  getProfile(@GetUser() user) {
    return user;
  }
}