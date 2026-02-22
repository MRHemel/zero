import { Controller, Get, Post, Body, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':productId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review for a product' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({ status: 201, description: 'Review created' })
  create(
    @Request() req,
    @Param('productId') productId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(
      req.user.id,
      productId,
      createReviewDto.rating,
      createReviewDto.comment,
    );
  }

  // @Get('product/:productId')
  // @ApiOperation({ summary: 'Get all reviews for a product' })
  // @ApiParam({ name: 'productId', description: 'Product UUID' })
  // @ApiResponse({ status: 200, description: 'Returns list of reviews' })
  // getProductReviews(@Param('productId') productId: string) {
  //   return this.reviewsService.getProductReviews(productId);
  // }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete own review' })
  @ApiParam({ name: 'id', description: 'Review UUID' })
  @ApiResponse({ status: 200, description: 'Review deleted' })
  remove(@Request() req, @Param('id') id: string) {
    return this.reviewsService.remove(req.user.id, id);
  }
}
