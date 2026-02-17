import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.CouponCreateInput) {
    return this.prisma.coupon.create({ data });
  }

  async findAll() {
    return this.prisma.coupon.findMany();
  }

  async findByCode(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
    });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async validateCoupon(code: string) {
    const coupon = await this.findByCode(code);
    if (!coupon.isActive) throw new BadRequestException('Coupon is inactive');
    if (new Date() > coupon.expiryDate) throw new BadRequestException('Coupon is expired');
    return coupon;
  }

  async remove(id: string) {
    return this.prisma.coupon.delete({ where: { id } });
  }
}
