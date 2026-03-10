import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { GetProductsDto } from "./dto/get-products.dto";
import { parsePagination } from "../../common/utils/pagination.util";
import { AddonService } from "../addon/addon.service";

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly addonService: AddonService,
  ) {}

  private validateTenantId(tenantId: string | null | undefined): string {
    if (!tenantId) {
      throw new BadRequestException("Tenant ID is required");
    }
    return tenantId;
  }

  async getProducts(tenantId: string, query: GetProductsDto) {
    this.validateTenantId(tenantId);

    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where = {
      tenantId,
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: "insensitive" as const } },
          { sku: { contains: query.search, mode: "insensitive" as const } },
          { barcode: { contains: query.search, mode: "insensitive" as const } },
        ],
      }),
      ...(query.category && { category: query.category }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.ids && {
        id: { in: Array.isArray(query.ids) ? query.ids : [query.ids] },
      }),
    };

    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string, tenantId: string) {
    this.validateTenantId(tenantId);

    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return product;
  }

  async getLowStockProducts(tenantId: string) {
    this.validateTenantId(tenantId);

    const products = await this.prisma.$queryRaw`
      SELECT * FROM products
      WHERE "tenantId" = ${tenantId}
        AND "isActive" = true
        AND stock <= "minStock"
      ORDER BY stock ASC
    `;
    return { data: products };
  }

  async createProduct(dto: any, tenantId: string, _userRole?: string) {
    this.validateTenantId(tenantId);
    const productName = typeof dto?.name === "string" ? dto.name.trim() : "";
    if (!productName) {
      throw new BadRequestException("Product name is required");
    }

    await this.addonService.assertLimitAvailable("ADD_PRODUCTS", tenantId, "Product");

    const product = await this.prisma.product.create({
      data: {
        tenantId,
        name: productName,
        description: dto.description,
        price: dto.price || 0,
        cost: dto.cost || 0,
        stock: dto.stock || 0,
        minStock: dto.minStock || 0,
        category: dto.category,
        sku: dto.sku,
        barcode: dto.barcode,
        image: dto.image,
        isActive: dto.isActive !== false,
        isConsignment: dto.isConsignment || false,
      },
    });

    return product;
  }

  async updateProduct(id: string, dto: any, tenantId: string) {
    const existingProduct = await this.getProductById(id, tenantId);

    if (existingProduct.isActive === false && dto.isActive === true) {
      await this.addonService.assertLimitAvailable("ADD_PRODUCTS", tenantId, "Product");
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.cost !== undefined && { cost: dto.cost }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
        ...(dto.minStock !== undefined && { minStock: dto.minStock }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.sku !== undefined && { sku: dto.sku }),
        ...(dto.barcode !== undefined && { barcode: dto.barcode }),
        ...(dto.image !== undefined && { image: dto.image }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.isConsignment !== undefined && {
          isConsignment: dto.isConsignment,
        }),
      },
    });

    return product;
  }

  async deleteProduct(id: string, tenantId: string) {
    await this.getProductById(id, tenantId);

    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: "Product deleted successfully" };
  }

  async updateStock(
    id: string,
    quantity: number,
    tenantId: string,
    operation: "set" | "add" | "subtract" = "set",
  ) {
    // Use transaction with retry logic for optimistic concurrency control
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await this.prisma.$transaction(async (tx) => {
          // Read current stock
          const product = await tx.product.findFirst({
            where: { id, tenantId },
          });

          if (!product) {
            throw new NotFoundException("Product not found");
          }

          let newStock: number;
          switch (operation) {
            case "add":
              newStock = product.stock + quantity;
              break;
            case "subtract":
              newStock = product.stock - quantity;
              if (newStock < 0) {
                throw new BadRequestException("Insufficient stock");
              }
              break;
            case "set":
            default:
              newStock = quantity;
              break;
          }

          // Update with optimistic concurrency check
          const updated = await tx.product.updateMany({
            where: {
              id,
              stock: product.stock, // Optimistic lock: only update if stock unchanged
            },
            data: { stock: newStock },
          });

          if (updated.count === 0) {
            // Stock was modified by another transaction, retry
            throw new Error("CONCURRENT_MODIFICATION");
          }

          return { ...product, stock: newStock };
        });

        return result;
      } catch (error: any) {
        if (
          error.message === "CONCURRENT_MODIFICATION" &&
          attempt < maxRetries - 1
        ) {
          // Retry with exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, 10 * (attempt + 1)),
          );
          continue;
        }
        throw error;
      }
    }

    throw new BadRequestException(
      "Failed to update stock due to high concurrency",
    );
  }

  async bulkDeleteProducts(productIds: string[], tenantId: string) {
    await this.prisma.product.updateMany({
      where: { id: { in: productIds }, tenantId },
      data: { isActive: false },
    });
    return { message: "Products deleted", count: productIds.length };
  }

  async getCategories(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: { category: true },
      distinct: ["category"],
    });
    return products.map((p) => p.category).filter(Boolean);
  }

  async searchProducts(tenantId: string, query: string) {
    return this.prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          { barcode: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 20,
    });
  }

  async getProductHistory(tenantId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const adjustments = await this.prisma.productAdjustment.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return { product, adjustments };
  }

  async duplicateProduct(tenantId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    await this.addonService.assertLimitAvailable("ADD_PRODUCTS", tenantId, "Product");

    const newProduct = await this.prisma.product.create({
      data: {
        ...product,
        id: undefined,
        name: `${product.name} (Copy)`,
        sku: `${product.sku}-copy`,
        createdAt: undefined,
        updatedAt: undefined,
      },
    });

    return newProduct;
  }

  async bulkUpdateProducts(tenantId: string, productIds: string[], data: any) {
    await this.prisma.product.updateMany({
      where: { id: { in: productIds }, tenantId },
      data,
    });

    return { message: "Products updated", count: productIds.length };
  }
}
