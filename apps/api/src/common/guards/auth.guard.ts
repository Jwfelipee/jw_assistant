import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { IS_PUBLIC_KEY, SESSION_COOKIE } from '../../auth/auth.constants';
import type { AuthUser } from '../decorators/current-user.decorator';

type JwtPayload = {
  sub: string;
  email: string;
};

type RequestWithUser = Request & { user?: AuthUser };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = request.cookies?.[SESSION_COOKIE] as string | undefined;

    if (!token) {
      throw new UnauthorizedException('Sessão necessária');
    }

    try {
      const secret = this.config.getOrThrow<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });

      request.user = { id: payload.sub, email: payload.email };
      return true;
    } catch {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }
  }
}
