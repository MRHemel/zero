import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validates a user by email OR full phone number (e.g. +8801712345678).
   * Called by LocalStrategy before issuing a JWT.
   */
  async validateUser(identifier: string, pass: string): Promise<any> {
    // Determine if identifier is a phone (starts with +) or email
    const isPhone = identifier.startsWith('+');

    const user = isPhone
      ? await this.usersService.findByPhone(identifier)
      : await this.usersService.findByEmail(identifier);

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    console.log(payload);
    return {
      success: true,
      message: 'Login successful',
      data: {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          countryCode: user.countryCode ?? null,
          phone: user.phone ?? null,
          role: user.role,
        },
      },
    };
  }

  async register(data: RegisterDto) {
    // Prevent duplicate email
    const emailExists = await this.usersService.findByEmail(data.email);
    if (emailExists) {
      throw new UnauthorizedException('A user with this email already exists');
    }

    // Prevent duplicate phone when provided
    if (data.phone) {
      const fullPhone = `${data.countryCode}${data.phone}`;
      const phoneExists = await this.usersService.findByPhone(fullPhone);
      if (phoneExists) {
        throw new UnauthorizedException('A user with this phone number already exists');
      }

      // Store as full international number (e.g. +8801712345678)
      const user = await this.usersService.create({
        ...data,
        phone: fullPhone,
      });
      const loginResult = await this.login(user);
      return {
        success: true,
        message: 'User registered successfully',
        data: loginResult.data,
      };
    }

    const user = await this.usersService.create(data);
    const loginResult = await this.login(user);
    return {
      success: true,
      message: 'User registered successfully',
      data: loginResult.data,
    };
  }
}
