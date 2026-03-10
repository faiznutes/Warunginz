import { SetMetadata } from "@nestjs/common";
import { TenantFeatureCode } from "../utils/subscription-catalog.util";

export const REQUIRED_TENANT_FEATURES_KEY = "requiredTenantFeatures";

export const RequireTenantFeature = (...features: TenantFeatureCode[]) =>
  SetMetadata(REQUIRED_TENANT_FEATURES_KEY, features);
