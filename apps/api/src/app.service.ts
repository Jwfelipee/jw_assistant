import { Injectable } from '@nestjs/common';
import { Sex } from '@jw/shared';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  /** Confirms @jw/shared resolves in the API package. */
  listSexes(): Sex[] {
    return [Sex.MALE, Sex.FEMALE];
  }
}
