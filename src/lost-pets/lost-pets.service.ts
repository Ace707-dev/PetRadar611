import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LostPet } from './entities/lost-pet.entity';
import { CreateLostPetDto } from './dto/create-lost-pet.dto';

export interface NearbyLostPet extends LostPet {
  distance: number;
  latitude: number;
  longitude: number;
}

@Injectable()
export class LostPetsService {
  constructor(
    @InjectRepository(LostPet)
    private readonly lostPetRepo: Repository<LostPet>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateLostPetDto): Promise<LostPet> {
    const result = await this.dataSource.query(
      `
      INSERT INTO lost_pets
        (name, species, breed, color, size, description, photo_url,
         owner_name, owner_email, owner_phone,
         location, address, lost_date, is_active)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7,
         $8, $9, $10,
         ST_SetSRID(ST_MakePoint($11, $12), 4326),
         $13, $14, true)
      RETURNING
        id, name, species, breed, color, size, description, photo_url,
        owner_name, owner_email, owner_phone,
        address, lost_date, is_active, created_at, updated_at,
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude
      `,
      [
        dto.name,
        dto.species,
        dto.breed,
        dto.color,
        dto.size,
        dto.description,
        dto.photo_url ?? null,
        dto.owner_name,
        dto.owner_email,
        dto.owner_phone,
        dto.longitude, // ST_MakePoint(lng, lat)
        dto.latitude,
        dto.address,
        dto.lost_date,
      ],
    );

    return result[0];
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radiusMeters: number = 500,
  ): Promise<NearbyLostPet[]> {
    const results = await this.dataSource.query(
      `
      SELECT
        id, name, species, breed, color, size, description, photo_url,
        owner_name, owner_email, owner_phone,
        address, lost_date, is_active, created_at, updated_at,
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude,
        ST_Distance(
          location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) AS distance
      FROM lost_pets
      WHERE
        is_active = true
        AND ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
      ORDER BY distance ASC
      `,
      [longitude, latitude, radiusMeters],
    );

    return results;
  }

  async findAll(): Promise<LostPet[]> {
    const results = await this.dataSource.query(
      `
      SELECT
        id, name, species, breed, color, size, description, photo_url,
        owner_name, owner_email, owner_phone,
        address, lost_date, is_active, created_at, updated_at,
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude
      FROM lost_pets
      WHERE is_active = true
      ORDER BY created_at DESC
      `,
    );
    return results;
  }
}
