import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LoginUsuarioDto {
  @ApiProperty()
  @IsString()
  usuario: string;

  @ApiProperty()
  @IsString()
  contrasena: string;
}