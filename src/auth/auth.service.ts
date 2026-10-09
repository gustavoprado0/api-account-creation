import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const user = await this.usersService.create(dto); 
    const { password, ...safe } = user;
    return safe;
  }

async login({ email, password }: LoginDto) {
  const user = await this.usersService.findByEmail(email);
  if (!user?.password) throw new UnauthorizedException('Credenciais inválidas');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new UnauthorizedException('Credenciais inválidas');

  const payload = { sub: user.id, email: user.email };
  return { access_token: await this.jwtService.signAsync(payload) };
}
}
