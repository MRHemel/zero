import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { unlink } from 'fs/promises';
import { join } from 'path';

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
    await this.productsService_deleteProductImages(id);
    await this.prisma.product.delete({ where: { id } });
    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }

  // ─── Image Helpers ───────────────────────────────────────────────────────────

  async setPrimaryImage(id: string, file: Express.Multer.File, baseUrl: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    // Delete old primary image from disk (if any)
    if (product.imageUrl) {
      await this.deleteFileFromDisk(product.imageUrl, baseUrl);
    }

    const imageUrl = `${baseUrl}/uploads/products/${file.filename}`;

    const updated = await this.prisma.product.update({
      where: { id },
      data: { imageUrl },
    });
    return {
      success: true,
      message: 'Primary image uploaded successfully',
      data: { imageUrl: updated.imageUrl },
    };
  }

  async addGalleryImages(id: string, files: Express.Multer.File[], baseUrl: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    const newUrls = files.map((f) => `${baseUrl}/uploads/products/${f.filename}`);
    const imageUrls = [...product.imageUrls, ...newUrls];

    const updated = await this.prisma.product.update({
      where: { id },
      data: { imageUrls },
    });
    return {
      success: true,
      message: `${files.length} gallery image(s) uploaded successfully`,
      data: { imageUrls: updated.imageUrls },
    };
  }

  async removeImages(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    await this.productsService_deleteProductImages(id);

    await this.prisma.product.update({
      where: { id },
      data: { imageUrl: null, imageUrls: [] },
    });
    return {
      success: true,
      message: 'All product images removed successfully',
    };
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  private async productsService_deleteProductImages(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) return;

    const allUrls = [
      ...(product.imageUrl ? [product.imageUrl] : []),
      ...product.imageUrls,
    ];

    for (const url of allUrls) {
      // Extract filename from URL and build local path
      const filename = url.split('/uploads/products/')[1];
      if (filename) {
        const filePath = join(process.cwd(), 'uploads', 'products', filename);
        await unlink(filePath).catch(() => {
          // Silently ignore if file already deleted
        });
      }
    }
  }

  private async deleteFileFromDisk(url: string, _baseUrl: string) {
    const filename = url.split('/uploads/products/')[1];
    if (filename) {
      const filePath = join(process.cwd(), 'uploads', 'products', filename);
      await unlink(filePath).catch(() => {});
    }
  }
}
