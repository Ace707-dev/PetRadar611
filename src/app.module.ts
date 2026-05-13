import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LostPetsModule } from './lost-pets/lost-pets.module';
import { FoundPetsModule } from './found-pets/found-pets.module';
import { MailModule } from './mail/mail.module';
import { RedisModule } from './common/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres'),
        database: config.get('DB_DATABASE', 'petradar'),
        synchronize: false,
        autoLoadEntities: true,
        logging: config.get('NODE_ENV') !== 'production',
      }),
    }),

    RedisModule, // Global — inyectable en todos los módulos sin importar explícitamente

    LostPetsModule,
    FoundPetsModule,
    MailModule,
  ],
})
export class AppModule {}
