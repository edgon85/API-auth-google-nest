import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { AuthService } from '../auth.service';

@Injectable()
export class NextAuthStrategy extends PassportStrategy(Strategy, 'next-auth') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(req: any): Promise<any> {

    const { email, name } = req.body.data;

    const user = await  this.authService.validateUserOauth(email, name);

    if (!user) throw new UnauthorizedException(`Token is not valid`);

    if (!user.isActive)
      throw new UnauthorizedException('User is inactive, talk with an admin');


      console.log(user);
    return user;
  }
}
