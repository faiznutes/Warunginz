import { Controller, Get, Post, Param, UseGuards } from "@nestjs/common";
import { AdminMonitorService } from "./admin-monitor.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("admin-monitor")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminMonitorController {
  constructor(private readonly adminMonitorService: AdminMonitorService) {}

  @Get("health")
  @Roles("SUPER_ADMIN")
  async getSystemHealth() {
    return this.adminMonitorService.getSystemHealth();
  }

  @Get("tenants")
  @Roles("SUPER_ADMIN")
  async getTenantStats() {
    return this.adminMonitorService.getTenantStats();
  }

  @Get("docker/containers")
  @Roles("SUPER_ADMIN")
  async getDockerContainers() {
    return this.adminMonitorService.getDockerContainers();
  }

  @Post("docker/restart/:name")
  @Roles("SUPER_ADMIN")
  async restartDockerContainer(@Param("name") name: string) {
    return this.adminMonitorService.restartContainer(name);
  }

  @Post("docker/stop/:name")
  @Roles("SUPER_ADMIN")
  async stopDockerContainer(@Param("name") name: string) {
    return this.adminMonitorService.stopContainer(name);
  }

  @Get("docker/logs/:name")
  @Roles("SUPER_ADMIN")
  async getDockerLogs(@Param("name") name: string) {
    return this.adminMonitorService.getContainerLogs(name);
  }

  @Get("server/resources")
  @Roles("SUPER_ADMIN")
  async getServerResources() {
    return this.adminMonitorService.getServerResources();
  }

  @Get("database/stats")
  @Roles("SUPER_ADMIN")
  async getDatabaseStats() {
    return this.adminMonitorService.getDatabaseStats();
  }
}
