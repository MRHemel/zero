import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Users } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UsersCreateInput): Promise<Users> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.users.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async findByEmail(email: string): Promise<Users | null> {
    return this.prisma.users.findUnique({
      where: { email },
    });
  }

  async findByPhone(phone: string): Promise<Users | null> {
    return this.prisma.users.findUnique({
      where: { phone },
    });
  }

  async findById(id: string): Promise<Users | null> {
    return this.prisma.users.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.UsersUpdateInput): Promise<Users> {
    if (data.password && typeof data.password === 'string') {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.prisma.users.update({
      where: { id },
      data,
    });
  }
}
