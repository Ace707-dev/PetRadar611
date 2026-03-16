import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FoundPet } from './entities/found-pet.entity';
import { CreateFoundPetDto } from './dto/create-found-pet.dto';
import { LostPetsService, NearbyLostPet } from '../lost-pets/lost-pets.service';
import { MailService } from '../mail/mail.service';

const SEARCH_RADIUS_METERS = 500;

@Injectable()
export class FoundPetsService {
  private readonly logger = new Logger(FoundPetsService.name);

  constructor(
    @InjectRepository(FoundPet)
    private readonly foundPetRepo: Repository<FoundPet>,
    private readonly dataSource: DataSource,
    private readonly lostPetsService: LostPetsService,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateFoundPetDto): Promise<{
    foundPet: FoundPet;
    nearbyLostPets: NearbyLostPet[];
    notificationsSent: number;
  }> {
    const result = await this.dataSource.query(
      `
      INSERT INTO found_pets
        (species, breed, color, size, description, photo_url,
         finder_name, finder_email, finder_phone,
         location, address, found_date)
      VALUES
        ($1, $2, $3, $4, $5, $6,
         $7, $8, $9,
         ST_SetSRID(ST_MakePoint($10, $11), 4326),
         $12, $13)
      RETURNING
        id, species, breed, color, size, description, photo_url,
        finder_name, finder_email, finder_phone,
        address, found_date, created_at, updated_at,
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude
      `,
      [
        dto.species,
        dto.breed ?? null,
        dto.color,
        dto.size,
        dto.description,
        dto.photo_url ?? null,
        dto.finder_name,
        dto.finder_email,
        dto.finder_phone,
        dto.longitude,
        dto.latitude,
        dto.address,
        dto.found_date,
      ],
    );

    const foundPet: FoundPet & { latitude: number; longitude: number } =
      result[0];

    const nearbyLostPets = await this.lostPetsService.findNearby(
      dto.latitude,
      dto.longitude,
      SEARCH_RADIUS_METERS,
    );

    this.logger.log(
      `Mascotas perdidas encontradas en ${SEARCH_RADIUS_METERS}m: ${nearbyLostPets.length}`,
    );

    let notificationsSent = 0;
    for (const lostPet of nearbyLostPets) {
      try {
        await this.mailService.sendFoundPetNotification({
          foundPet: { ...foundPet },
          lostPet,
        });
        notificationsSent++;
        this.logger.log(
          `Notificación enviada a ${lostPet.owner_email} por mascota ${lostPet.name}`,
        );
      } catch (err) {
        this.logger.error(
          `Error enviando correo a ${lostPet.owner_email}: ${err.message}`,
        );
      }
    }

    return {
      foundPet,
      nearbyLostPets,
      notificationsSent,
    };
  }
}
