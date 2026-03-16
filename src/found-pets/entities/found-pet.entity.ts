import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('found_pets')
export class FoundPet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  species: string;

  @Column({ nullable: true })
  breed: string;

  @Column()
  color: string;

  @Column()
  size: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  photo_url: string;

  @Column()
  finder_name: string;

  @Column()
  finder_email: string;

  @Column()
  finder_phone: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: false,
    select: false,
  })
  location: string;

  @Column()
  address: string;

  @Column({ type: 'timestamp' })
  found_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
