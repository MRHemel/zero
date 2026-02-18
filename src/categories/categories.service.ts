import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.CategoryCreateInput) {
    const category = await this.prisma.category.create({ data });
    return {
      success: true,
      message: 'Category created successfully',
      data: category,
    };
  }

  async findAll() {
    const categories = await this.prisma.category.findMany({
      include: { products: true },
    });
    return {
      success: true,
      message: 'Categories fetched successfully',
      data: categories,
    };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
    if (!category) throw new NotFoundException('Category not found');
    return {
      success: true,
      message: 'Category fetched successfully',
      data: category,
    };
  }

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    const category = await this.prisma.category.update({
      where: { id },
      data,
    });
    return {
      success: true,
      message: 'Category updated successfully',
      data: category,
    };
  }

  async remove(id: string) {
    await this.prisma.category.delete({ where: { id } });
    return {
      success: true,
      message: 'Category deleted successfully',
    };
  }
}
