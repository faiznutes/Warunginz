import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async getTickets(tenantId: string) {
    return this.prisma.supportTicket.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
  }

  async createTicket(data: any, tenantId: string, userId?: string) {
    return this.prisma.supportTicket.create({
      data: {
        tenantId,
        userId: userId || null,
        name: data.name || "",
        email: data.email || "",
        subject: data.subject || "",
        message: data.message || "",
        type: data.type || "support",
        priority: data.priority || "MEDIUM",
        status: "OPEN",
      },
    });
  }

  async assignTicket(id: string, data: any) {
    return this.prisma.supportTicket.update({
      where: { id },
      data: { repliedBy: data.assignee || data.userId },
    });
  }

  async addNote(id: string, data: any) {
    return { success: true, ticketId: id, note: data.note || "" };
  }

  async replyTicket(id: string, data: any) {
    return this.prisma.supportTicket.update({
      where: { id },
      data: {
        reply: data.reply || data.message || "",
        repliedAt: new Date(),
        repliedBy: data.repliedBy || null,
        status: "REPLIED",
      },
    });
  }
}
