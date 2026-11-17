import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserSkillDto } from './dto/create-user-skill.dto';
import { UpdateUserSkillDto } from './dto/update-user-skill.dto';
import { UserSkillsService } from './user-skills.service';

@Controller('user-skills')
@UseGuards(JwtAuthGuard)
export class UserSkillsController {
  constructor(private readonly service: UserSkillsService) {}

  @Post()
  create(@CurrentUserId() userId: string, @Body() dto: CreateUserSkillDto) {
    return this.service.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUserId() userId: string) {
    return this.service.findAll(userId);
  }

  @Get(':skillId')
  findOne(@CurrentUserId() userId: string, @Param('skillId', new ParseUUIDPipe()) skillId: string) {
    return this.service.findOne(userId, skillId);
  }

  @Patch(':skillId')
  update(
    @CurrentUserId() userId: string,
    @Param('skillId', new ParseUUIDPipe()) skillId: string,
    @Body() dto: UpdateUserSkillDto,
  ) {
    return this.service.update(userId, skillId, dto);
  }

  @Delete(':skillId')
  @HttpCode(204)
  remove(@CurrentUserId() userId: string, @Param('skillId', new ParseUUIDPipe()) skillId: string) {
    return this.service.remove(userId, skillId);
  }
}
