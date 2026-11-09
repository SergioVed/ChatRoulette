import { Module } from '@nestjs/common';
import { UserMatchingService } from './user-matching.service';
import {UserMatchingGateway} from "./user-matching-gateway";

@Module({
  controllers: [],
  providers: [UserMatchingService, UserMatchingGateway]
})
export class UserMatchingModule {}
