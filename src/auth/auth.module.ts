import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from './entities';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy, JwtStrategy } from './strategies';
import { SessionSerializer } from './serializer';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, SessionSerializer],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '2h',
          },
        };
      },
    }),
  ],
  exports: [TypeOrmModule, PassportModule, JwtModule],
})
export class AuthModule {}
