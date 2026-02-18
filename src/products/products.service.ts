import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ProductUncheckedCreateInput) {
    const product = await this.prisma.product.create({ data });
    return {
      success: true,
      message: 'Product created successfully',
      data: product,
    };
  }

  async findAll(query: { categoryId?: string; search?: string }) {
    const { categoryId, search } = query;
    const products = await this.prisma.product.findMany({
      where: {
        ...(categoryId && { categoryId }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: { category: true },
    });
    return {
      success: true,
      message: 'Products fetched successfully',
      data: products,
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, reviews: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return {
      success: true,
      message: 'Product fetched successfully',
      data: product,
    };
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    const product = await this.prisma.product.update({
      where: { id },
      data,
    });
    return {
      success: true,
      message: 'Product updated successfully',
      data: product,
    };
  }

  async remove(id: string) {
    await this.prisma.product.delete({ where: { id } });
    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }
}
