import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { ResponseInterceptor } from "../interceptors/response.interceptor";
import { PerformanceMonitoringInterceptor } from "../interceptors/performance-monitoring.interceptor";

export function WithResponseWrapper() {
  return applyDecorators(
    UseInterceptors(ResponseInterceptor, PerformanceMonitoringInterceptor),
  );
}
