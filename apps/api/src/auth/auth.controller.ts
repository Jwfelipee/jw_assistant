import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SESSION_COOKIE } from './auth.constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateCredentials(
      dto.email,
      dto.password,
    );
    const token = await this.authService.signSessionToken(user);
    res.cookie(SESSION_COOKIE, token, this.authService.cookieOptions());
    return { user };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(SESSION_COOKIE, {
      httpOnly: true,
      secure: this.authService.cookieOptions().secure,
      sameSite: 'lax',
      path: '/',
    });
    return { ok: true };
  }

  @Get('me')
  async me(@CurrentUser() authUser: AuthUser | undefined) {
    if (!authUser) {
      throw new UnauthorizedException('Sessão necessária');
    }

    const user = await this.authService.getUserById(authUser.id);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return { user };
  }
}
