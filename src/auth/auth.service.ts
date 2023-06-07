import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entities';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly authRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /* ························································· */
  public async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.authRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.authRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: this.getToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  public async createUserOauth(emailOauth: string, fullNameOauth: string) {
    try {
      const newUser = {
        email: emailOauth,
        password: bcrypt.hashSync('P@ssw0rd', 10),
        fullName: fullNameOauth,
      };

      const user = this.authRepository.create(newUser);
      await this.authRepository.save(user);

      return {
        ...user,
        token: this.getToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  /* ························································· */
  public async validateUserOauth(emailOauth: string, fullNameOauth: string) {
    const user = await this.authRepository.findOneBy({ email: emailOauth });

    if (user)
      return {
        ...user,
        token: this.getToken({ id: user.id }),
      };

    const tempUser = {
      email: emailOauth,
      password: bcrypt.hashSync('P@ssw0rd', 10),
      fullName: fullNameOauth,
    };

    const newUser = this.authRepository.create(tempUser);

    await this.authRepository.save(newUser);

    delete newUser.password;

    return {
      ...newUser,
      token: this.getToken({ id: user.id }),
    };
  }
  /* ························································· */
  public async login(loginUsedDto: LoginUserDto) {
    const { email, password } = loginUsedDto;

    const user = await this.authRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        fullName: true,
        roles: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credentials are not valid (password)');
    }

    delete user.password;
    return {
      ...user,
      token: this.getToken({ id: user.id }),
    };
  }

  /* ······················································ */

  async findUser(id: string) {
    const user = await this.authRepository.findOneBy({ id });
    return this.checkAuthStatus(user);
  }

  /* ······················································ */
  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getToken({ id: user.id }),
    };
  }

  /* ······················································ */
  private getToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);

    return token;
  }

  /* ······················································ */
  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    console.log(error);

    throw new InternalServerErrorException('please check server errors');
  }
}
