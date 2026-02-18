import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CouponsService } from '../coupons/coupons.service';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private couponsService: CouponsService,
    private cartService: CartService,
  ) {}

  async createOrder(userId: string, shippingAddress: string, couponCode?: string) {
    const cartResult = await this.cartService.getCart(userId);
    const cart = cartResult.data;
    if (!cart.items.length) {
      throw new BadRequestException('Cart is empty');
    }

    let discount = 0;
    let couponId: string | null = null;

    if (couponCode) {
      const coupon = await this.couponsService.validateCoupon(couponCode);
      discount = coupon.discountAmount;
      couponId = coupon.id;
    }

    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0) - discount;

    const order = await this.prisma.$transaction(async (tx) => {
      // 1. Create the order
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount: Math.max(0, totalAmount),
          shippingAddress,
          couponId,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: { items: true },
      });

      // 2. Update stock for each product
      for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product: ${item.product.name}`);
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 3. Clear the cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });

    return {
      success: true,
      message: 'Order placed successfully',
      data: order,
    };
  }

  async getUserOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return {
      success: true,
      message: 'Orders fetched successfully',
      data: orders,
    };
  }

  async getOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, user: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return {
      success: true,
      message: 'Order fetched successfully',
      data: order,
    };
  }
}
