import { ApiProperty } from '@nestjs/swagger';

export class RolEntity {
  @ApiProperty({
    description: 'ID único del rol',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre del rol',
    example: 'ADMINISTRADOR',
  })
  nombre: string;

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Usuario con permisos completos del sistema',
    nullable: true,
  })
  descripcion: string | null;
}