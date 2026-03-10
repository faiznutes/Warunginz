import { SetMetadata } from "@nestjs/common";
import { TENANT_REQUIRED_KEY } from "../guards/tenant.guard";

export const TenantRequired = (required = true) =>
  SetMetadata(TENANT_REQUIRED_KEY, required);
