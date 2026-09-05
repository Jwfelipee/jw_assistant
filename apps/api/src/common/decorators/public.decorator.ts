import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../../auth/auth.constants';

/** Marks a route as accessible without an authenticated session. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
