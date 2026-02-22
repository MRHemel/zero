import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, productId: string, rating: number, comment: string) {
    const review = await this.prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment,
      },
    });
    return {
      success: true,
      message: 'Review created successfully',
      data: review,
    };
  }

  // async getProductReviews(productId: string) {
  //   const reviews = await this.prisma.review.findMany({
  //     where: { productId },
  //     include: { user: { select: { name: true } } },
  //     orderBy: { createdAt: 'desc' },
  //   });
  //   return {
  //     success: true,
  //     message: 'Reviews fetched successfully',
  //     data: reviews,
  //   };
  // }

  async remove(userId: string, id: string) {
    await this.prisma.review.deleteMany({
      where: { id, userId },
    });
    return {
      success: true,
      message: 'Review deleted successfully',
    };
  }
}
