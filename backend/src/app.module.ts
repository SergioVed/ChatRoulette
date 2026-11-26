import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import { ChatModule } from './chat/chat.module';
import { SkillsModule } from './skills/skills.module';
import { UserSkillsModule } from './user-skills/user-skills.module';
import { AISummaryModule } from './AISummary/AISummary.module';
import { CallModule } from './calls/call.module';

@Module({
  imports: [
      AuthModule,
      UsersModule,
      ChatModule,

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',

        host: config.getOrThrow<string>('DB_HOST'),
        port: Number(config.getOrThrow<string>('DB_PORT')),

        username: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),

        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    UserSkillsModule,
    SkillsModule,
    CallModule,
    AISummaryModule,
  ],
})
export class AppModule {}
