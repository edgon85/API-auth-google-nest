import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators';
import { User } from './entities';
import { GoogleAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard('jwt'))
  testingPrivateRoute(
    // @Req() req: Express.Request
    @GetUser() user: User,
  ) {
    console.log(user);
    return {
      ok: true,
      message: 'Hola mundo',
      user,
    };
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  async handleLogin() {
    return { msg: 'Google authentication' };
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async handleRedirect(
    /* @Res() res: Express.Request,
    @GetUser() user: User, */
    @Req() req: Express.Request,
  ) {
    return { msg: 'ok', user: req.user };
  }

  @Post('next-auth')
  @UseGuards(AuthGuard('next-auth'))
  async getExampleData(@Req() req: Express.Request) {
    console.log(req.user);
    
    return {
      ok: true,
      user: req.user,
    };
  }
}
