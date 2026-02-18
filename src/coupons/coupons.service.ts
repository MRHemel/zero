import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.CouponCreateInput) {
    const coupon = await this.prisma.coupon.create({ data });
    return {
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    };
  }

  async findAll() {
    const coupons = await this.prisma.coupon.findMany();
    return {
      success: true,
      message: 'Coupons fetched successfully',
      data: coupons,
    };
  }

  async findByCode(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
    });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return {
      success: true,
      message: 'Coupon fetched successfully',
      data: coupon,
    };
  }

  async validateCoupon(code: string) {
    const result = await this.findByCode(code);
    const coupon = result.data;
    if (!coupon.isActive) throw new BadRequestException('Coupon is inactive');
    if (new Date() > coupon.expiryDate) throw new BadRequestException('Coupon is expired');
    return coupon;
  }

  async remove(id: string) {
    await this.prisma.coupon.delete({ where: { id } });
    return {
      success: true,
      message: 'Coupon deleted successfully',
    };
  }
}
