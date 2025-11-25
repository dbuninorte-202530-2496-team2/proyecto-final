import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';

import {
    ApiOperation,
    ApiTags,
    ApiResponse,
    ApiParam,
} from '@nestjs/swagger';

import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) { }

    @Post()
    @Auth(ValidRoles.ADMINISTRADOR)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Crear un nuevo usuario',
        description: 'Solo accesible por ADMINISTRADOR.',
    })
    @ApiResponse({
        status: 201,
        description: 'Usuario creado correctamente',
    })
    @ApiResponse({
        status: 400,
        description: 'Datos inválidos o usuario ya existe',
    })
    create(@Body() dto: CreateUsuarioDto) {
        return this.usuariosService.create(dto);
    }

    @Get()
    @Auth(ValidRoles.ADMINISTRADOR)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Listar todos los usuarios',
        description: 'Devuelve la lista completa de usuarios del sistema.',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de usuarios obtenida',
    })
    findAll() {
        return this.usuariosService.findAll();
    }

    @Get(':usuario')
    @Auth(ValidRoles.ADMINISTRADOR)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener usuario por nombre',
    })
    @ApiParam({
        name: 'usuario',
        type: String,
        description: 'Nombre de usuario a consultar',
    })
    @ApiResponse({
        status: 200,
        description: 'Usuario encontrado',
    })
    @ApiResponse({
        status: 404,
        description: 'Usuario no encontrado',
    })
    findOne(@Param('usuario') usuario: string) {
        return this.usuariosService.findOne(usuario);
    }

    @Put(':usuario')
    @Auth(ValidRoles.ADMINISTRADOR)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Actualizar un usuario',
    })
    @ApiParam({
        name: 'usuario',
        type: String,
        description: 'Nombre de usuario a actualizar',
    })
    @ApiResponse({
        status: 200,
        description: 'Usuario actualizado correctamente',
    })
    update(
        @Param('usuario') usuario: string,
        @Body() dto: UpdateUsuarioDto,
    ) {
        return this.usuariosService.update(usuario, dto);
    }

    @Delete(':usuario')
    @Auth(ValidRoles.ADMINISTRADOR)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Eliminar un usuario',
        description: 'Solo ADMINISTRADOR puede eliminar usuarios.',
    })
    @ApiParam({
        name: 'usuario',
        type: String,
        description: 'Usuario a eliminar',
    })
    @ApiResponse({
        status: 200,
        description: 'Usuario eliminado correctamente',
    })
    @ApiResponse({
        status: 404,
        description: 'Usuario no encontrado',
    })
    remove(@Param('usuario') usuario: string) {
        return this.usuariosService.remove(usuario);
    }

    @Post(':usuario/send-password')
    @Auth(ValidRoles.ADMINISTRADOR)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Enviar contraseña del usuario',
        description:
            'En un sistema real enviaría el correo; aquí es una simulación.',
    })
    @ApiParam({
        name: 'usuario',
        type: String,
        description: 'Usuario al que se enviará la contraseña',
    })
    @ApiResponse({
        status: 200,
        description: 'Contraseña enviada (simulado)',
    })
    sendPassword(@Param('usuario') usuario: string) {
        return this.usuariosService.sendPassword(usuario);
    }
}
