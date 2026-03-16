import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LostPetsService } from './lost-pets.service';
import { CreateLostPetDto } from './dto/create-lost-pet.dto';

@Controller('lost-pets')
export class LostPetsController {
  constructor(private readonly lostPetsService: LostPetsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateLostPetDto) {
    const pet = await this.lostPetsService.create(dto);
    return {
      message: 'Mascota perdida registrada exitosamente',
      data: pet,
    };
  }

  @Get()
  async findAll() {
    const pets = await this.lostPetsService.findAll();
    return {
      message: 'Mascotas perdidas activas',
      total: pets.length,
      data: pets,
    };
  }
}
