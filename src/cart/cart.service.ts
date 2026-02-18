import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      });
    }
    return {
      success: true,
      message: 'Cart fetched successfully',
      data: cart,
    };
  }

  async addToCart(userId: string, productId: string, quantity: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    const activeCart = cart ?? await this.prisma.cart.create({
      data: { userId },
      include: { items: { include: { product: true } } },
    });

    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: activeCart.id, productId },
    });

    if (existingItem) {
      const updated = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
      return {
        success: true,
        message: 'Cart item quantity updated successfully',
        data: updated,
      };
    }

    const created = await this.prisma.cartItem.create({
      data: {
        cartId: activeCart.id,
        productId,
        quantity,
      },
    });
    return {
      success: true,
      message: 'Item added to cart successfully',
      data: created,
    };
  }

  async removeFromCart(userId: string, cartItemId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) throw new NotFoundException('Cart not found');

    await this.prisma.cartItem.deleteMany({
      where: { id: cartItemId, cartId: cart.id },
    });
    return {
      success: true,
      message: 'Item removed from cart successfully',
    };
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) throw new NotFoundException('Cart not found');

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
    return {
      success: true,
      message: 'Cart cleared successfully',
    };
  }
}
