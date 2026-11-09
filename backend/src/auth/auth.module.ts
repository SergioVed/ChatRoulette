import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule, JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
      const secret = config.getOrThrow<string>('JWT_SECRET');
      if (!secret.trim()) throw new Error('JWT_SECRET must not be blank');
      return { secret, signOptions: { algorithm: 'HS256' as const, expiresIn: 3600 } };
    },
  })],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
