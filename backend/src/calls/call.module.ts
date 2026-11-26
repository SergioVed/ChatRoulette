import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CallController } from './call.controller';
import { Call } from './call.entity';
import { CallService } from './call.service';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([Call])],
    controllers: [CallController],
    providers: [CallService],
    exports: [CallService],
})
export class CallModule {}
