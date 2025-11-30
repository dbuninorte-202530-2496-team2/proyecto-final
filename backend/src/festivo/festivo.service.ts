import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFestivoDto } from './dto/create-festivo.dto';
import { UpdateFestivoDto } from './dto/update-festivo.dto';
import { FestivoEntity } from './entities/festivo.entity';

@Injectable()
export class FestivoService {
    private festivos: FestivoEntity[] = [];

    create(createFestivoDto: CreateFestivoDto) {
        const newFestivo: FestivoEntity = { id: Date.now(), ...createFestivoDto };
        this.festivos.push(newFestivo);
        return newFestivo;
    }

    findAll() {
        return this.festivos;
    }

    findOne(id: number) {
        const festivo = this.festivos.find(f => f.id === id);
        if (!festivo) throw new NotFoundException('Festivo no encontrado');
        return festivo;
    }

    update(id: number, updateFestivoDto: UpdateFestivoDto) {
        const festivoIndex = this.festivos.findIndex(f => f.id === id);
        if (festivoIndex === -1) throw new NotFoundException('Festivo no encontrado');
        this.festivos[festivoIndex] = { ...this.festivos[festivoIndex], ...updateFestivoDto };
        return this.festivos[festivoIndex];
    }

    remove(id: number) {
        const festivoIndex = this.festivos.findIndex(f => f.id === id);
        if (festivoIndex === -1) throw new NotFoundException('Festivo no encontrado');
        this.festivos.splice(festivoIndex, 1);
        return { message: `Festivo con id ${id} eliminado correctamente` };
    }
}
