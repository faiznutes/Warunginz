import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class TenantProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }
    return tenant;
  }

  async updateProfile(tenantId: string, data: any) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
    });
  }
}
