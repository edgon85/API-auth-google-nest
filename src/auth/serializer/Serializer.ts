import { PassportSerializer } from '@nestjs/passport';
import { User } from '../entities';
import { AuthService } from '../auth.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly authService: AuthService) {
    super();
  }

  serializeUser(user: User, done: Function) {
    console.log('Serializer User');
    done(null, user);
  }

  async deserializeUser(payload: any, done: Function) {
    // console.log(payload.id);
    const user = await this.authService.findUser(payload.id);

    /*   console.log('Deserializer');
    console.log(user); */

    return user ? done(null, user) : done(null, null);
  }
}
