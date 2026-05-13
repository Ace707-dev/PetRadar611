import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { FoundPetsService } from './found-pets.service';
import { CreateFoundPetDto } from './dto/create-found-pet.dto';

@Controller('found-pets')
export class FoundPetsController {
  constructor(private readonly foundPetsService: FoundPetsService) {}

  /**
   * GET /found-pets
   * Listado de mascotas encontradas — respuesta cacheada en Redis 60s
   */
  @Get()
  async findAll() {
    const pets = await this.foundPetsService.findAll();
    return {
      message: 'Mascotas encontradas',
      total: pets.length,
      data: pets,
    };
  }

  /**
   * POST /found-pets
   * Registra mascota encontrada y ejecuta búsqueda por radio de 500m en lost_pets
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateFoundPetDto) {
    const { foundPet, nearbyLostPets, notificationsSent } =
      await this.foundPetsService.create(dto);

    return {
      message: 'Mascota encontrada registrada exitosamente',
      data: {
        found_pet: foundPet,
        nearby_lost_pets_count: nearbyLostPets.length,
        notifications_sent: notificationsSent,
        nearby_lost_pets: nearbyLostPets.map((p) => ({
          id: p.id,
          name: p.name,
          species: p.species,
          owner_email: p.owner_email,
          distance_meters: Math.round(p.distance),
        })),
      },
    };
  }
}
