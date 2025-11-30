import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';

import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@Auth(ValidRoles.ADMINISTRADOR)
@Controller('usuarios')
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) { }

    @Post()
    create(@Body() dto: CreateUsuarioDto) {
        return this.usuariosService.create(dto);
    }

    @Get()
    findAll() {
        return this.usuariosService.findAll();
    }

    @Auth() //Sobreescritura del decorator a nivel de controller: el tutor puede ver su propio usuario
    @Get(':usuario')
    findOne(@Param('usuario') usuario: string) {
        return this.usuariosService.findOne(usuario);
    }

    @Put(':usuario')
    update(@Param('usuario') usuario: string, @Body() dto: UpdateUsuarioDto) {
        return this.usuariosService.update(usuario, dto);
    }

    @Delete(':usuario')
    remove(@Param('usuario') usuario: string) {
        return this.usuariosService.remove(usuario);
    }

    @Post(':usuario/send-password')
    sendPassword(@Param('usuario') usuario: string) {
        return this.usuariosService.sendPassword(usuario);
    }
}
