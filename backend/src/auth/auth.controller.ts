import {Body, Controller, HttpCode, Post, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {JwtAuthGuard} from "./jwt-auth.guard";
import {CurrentUserId} from "./current-user-id.decorator";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth-me')
  authMe(@CurrentUserId() userId: string) {
    return this.authService.authMe(userId);
  }
}
