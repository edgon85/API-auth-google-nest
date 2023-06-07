import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { User } from '../entities';
import { Repository } from 'typeorm';
import { AuthService } from '../auth.service';

export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    // configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {
    super({
      //   clientID: configService.get('GOOGLE_ID'),
      // clientSecret: configService.get('GOOGLE_SECRET'),
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: 'http://localhost:5000/api/auth/google/redirect',
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    /* console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);*/

    const email = profile.emails[0].value;
    const fullName = profile.displayName;

    const user = await this.authService.validateUserOauth(email, fullName);

    return user || null;
  }
}
