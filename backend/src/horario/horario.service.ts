import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { HorarioEntity } from './entities/horario.entity';

@Injectable()
export class HorarioService {

    private horarios: HorarioEntity[] = [];

    create(createHorarioDto: CreateHorarioDto) {
        const newHorario: HorarioEntity = { id: Date.now(), ...createHorarioDto };
        this.horarios.push(newHorario);
        return newHorario;
    }

    findAll() {
        return this.horarios;
    }

    findOne(id: number) {
        const horario = this.horarios.find(h => h.id === id);
        if (!horario) throw new NotFoundException('Horario no encontrado');
        return horario;
    }

    update(id: number, updateHorarioDto: UpdateHorarioDto) {
        const horarioIndex = this.horarios.findIndex(h => h.id === id);
        if (horarioIndex === -1) throw new NotFoundException('Horario no encontrado');


        this.horarios[horarioIndex] = { ...this.horarios[horarioIndex], ...updateHorarioDto };
        return this.horarios[horarioIndex];
    }

    remove(id: number) {
        const horarioIndex = this.horarios.findIndex(h => h.id === id);
        if (horarioIndex === -1) throw new NotFoundException('Horario no encontrado');

        this.horarios.splice(horarioIndex, 1);
        return { message: `Horario con id ${id} eliminado correctamente` };
    }
}
