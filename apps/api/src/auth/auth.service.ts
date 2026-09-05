import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@jw/database';
import { JWT_EXPIRES_IN } from './auth.constants';

export type PublicUser = {
  id: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<PublicUser> {
    const normalized = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalized },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return { id: user.id, email: user.email };
  }

  async signSessionToken(user: PublicUser): Promise<string> {
    const secret = this.config.getOrThrow<string>('JWT_SECRET');
    return this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      { secret, expiresIn: JWT_EXPIRES_IN },
    );
  }

  async getUserById(id: string): Promise<PublicUser | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });
    return user;
  }

  cookieOptions() {
    const secureEnv = this.config.get<string>('COOKIE_SECURE');
    const secure =
      secureEnv != null
        ? secureEnv === 'true'
        : this.config.get<string>('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  }
}
