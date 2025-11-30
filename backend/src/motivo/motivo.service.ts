import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMotivoDto } from './dto/create-motivo.dto';
import { UpdateMotivoDto } from './dto/update-motivo.dto';
import { MotivoEntity } from './entities/motivo.entity';

@Injectable()
export class MotivoService {
    private motivos: MotivoEntity[] = [];

    create(createMotivoDto: CreateMotivoDto) {
        const newMotivo: MotivoEntity = { id: Date.now(), ...createMotivoDto };
        this.motivos.push(newMotivo);
        return newMotivo;
    }

    findAll() {
        return this.motivos;
    }

    findOne(id: number) {
        const motivo = this.motivos.find(m => m.id === id);
        if (!motivo) throw new NotFoundException('Motivo no encontrado');
        return motivo;
    }

    update(id: number, updateMotivoDto: UpdateMotivoDto) {
        const motivoIndex = this.motivos.findIndex(m => m.id === id);
        if (motivoIndex === -1) throw new NotFoundException('Motivo no encontrado');
        this.motivos[motivoIndex] = { ...this.motivos[motivoIndex], ...updateMotivoDto };
        return this.motivos[motivoIndex];
    }

    remove(id: number) {
        const motivoIndex = this.motivos.findIndex(m => m.id === id);
        if (motivoIndex === -1) throw new NotFoundException('Motivo no encontrado');
        this.motivos.splice(motivoIndex, 1);
        return { message: `Motivo con id ${id} eliminado correctamente` };
    }
}
