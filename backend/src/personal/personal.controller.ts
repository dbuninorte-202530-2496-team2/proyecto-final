import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PersonalService } from './personal.service';
import { CreatePersonalDto } from './dto/create-personal.dto';
import { UpdatePersonalDto } from './dto/update-personal.dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@Auth(ValidRoles.ADMINISTRATIVO, ValidRoles.ADMINISTRADOR) //No concierne al tutor ninguna operación sobre el resto del personal
@ApiTags('Personal')
@Controller('personal')
export class PersonalController {
    constructor(private readonly personalService: PersonalService) { }

    @Post()
    @ApiOperation({ summary: 'Crear personal' })
    create(@Body() dto: CreatePersonalDto) {
        return this.personalService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todo el personal' })
    findAll() {
        return this.personalService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener personal por ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.personalService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar personal por ID' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePersonalDto,
    ) {
        return this.personalService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar personal por ID' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.personalService.remove(id);
    }

    @Get('tutores')
    @ApiOperation({ summary: 'Listar solo tutores' })
    findTutores() {
        return this.personalService.findTutores();
    }
}
