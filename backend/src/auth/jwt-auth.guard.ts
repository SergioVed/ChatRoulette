import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { isUUID } from 'class-validator';

export interface AuthenticatedRequest {
  headers: { authorization?: string };
  user: { id: string };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {

  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const match = /^Bearer\s+(\S+)$/i.exec(request.headers.authorization ?? '');
    if (!match) throw new UnauthorizedException();

    try {
      const payload = await this.jwt.verifyAsync<{ sub?: unknown }>(match[1], {
        algorithms: ['HS256'],
      });
      if (typeof payload.sub !== 'string' || !isUUID(payload.sub)) {
        throw new UnauthorizedException();
      }
      request.user = { id: payload.sub };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
