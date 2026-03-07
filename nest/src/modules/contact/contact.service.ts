import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { UpdateContactDto } from "./dto/update-contact.dto";
import { parsePagination } from "../../common/utils/pagination.util";

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async getContacts(query: any) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.type) {
      where.type = query.type;
    }

    const [contacts, total] = await Promise.all([
      this.prisma.contactSubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.contactSubmission.count({ where }),
    ]);

    return {
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getContactById(id: string) {
    const contact = await this.prisma.contactSubmission.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException("Contact submission not found");
    }

    return contact;
  }

  async createContact(data: CreateContactDto) {
    return this.prisma.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        type: data.type || "contact",
      },
    });
  }

  async updateContact(id: string, data: UpdateContactDto) {
    await this.getContactById(id);

    return this.prisma.contactSubmission.update({
      where: { id },
      data,
    });
  }

  async deleteContact(id: string) {
    await this.getContactById(id);
    await this.prisma.contactSubmission.delete({ where: { id } });
    return { success: true, message: "Contact submission deleted" };
  }

  async markAsRead(id: string) {
    await this.getContactById(id);

    return this.prisma.contactSubmission.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
}
