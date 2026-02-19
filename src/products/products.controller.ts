import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, UploadedFiles, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { multerProductOptions } from '../common/multer.config';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (Admin/Seller)' })
  @ApiResponse({ status: 201, description: 'Product created' })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin or Seller role required' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products (with optional filters)' })
  @ApiResponse({ status: 200, description: 'Returns list of products' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Returns product with category and reviews' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product (Admin/Seller)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product (Admin/Seller)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  // ─── Image Upload Endpoints ────────────────────────────────────────────────

  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/images/primary')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image', multerProductOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Primary product image (jpg, jpeg, png, webp, gif — max 5 MB)',
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload primary (thumbnail) image for a product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 201, description: 'Primary image uploaded and saved' })
  uploadPrimaryImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.productsService.setPrimaryImage(id, file, baseUrl);
  }

  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/images/gallery')
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images', 10, multerProductOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Gallery images (up to 10, jpg/jpeg/png/webp/gif — max 5 MB each)',
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload gallery images for a product (up to 10)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 201, description: 'Gallery images uploaded and appended' })
  uploadGalleryImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.productsService.addGalleryImages(id, files, baseUrl);
  }

  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id/images')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove all images from a product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Images removed' })
  removeImages(@Param('id') id: string) {
    return this.productsService.removeImages(id);
  }
}
