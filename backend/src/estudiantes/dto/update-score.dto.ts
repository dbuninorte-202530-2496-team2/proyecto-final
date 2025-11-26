import { IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateScoreDto {
  @ApiProperty({ example: 10, required: false })
  @IsOptional() @IsNumber()
  score_in?: number;

  @ApiProperty({ example: 8, required: false })
  @IsOptional() @IsNumber()
  score_out?: number;
}
