import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LostPet } from './entities/lost-pet.entity';
import { LostPetsService } from './lost-pets.service';
import { LostPetsController } from './lost-pets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LostPet])],
  providers: [LostPetsService],
  controllers: [LostPetsController],
  exports: [LostPetsService],
})
export class LostPetsModule {}
