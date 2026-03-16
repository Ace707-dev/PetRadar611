import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFoundPetDto {
  @IsString()
  @IsNotEmpty({ message: 'La especie es requerida (perro, gato, ave, etc.)' })
  species: string;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsString()
  @IsNotEmpty({ message: 'El color es requerido' })
  color: string;

  @IsIn(['pequeño', 'mediano', 'grande'], {
    message: 'El tamaño debe ser: pequeño, mediano o grande',
  })
  size: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  description: string;

  @IsOptional()
  @IsString()
  photo_url?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de quien encontró la mascota es requerido' })
  finder_name: string;

  @IsEmail({}, { message: 'El email de quien encontró no es válido' })
  finder_email: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono de quien encontró es requerido' })
  finder_phone: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude: number;

  @IsString()
  @IsNotEmpty({ message: 'La dirección es requerida' })
  address: string;

  @IsDateString({}, { message: 'La fecha de hallazgo debe ser ISO 8601' })
  found_date: string;
}
