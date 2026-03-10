import { createParamDecorator, ExecutionContext } from "@nestjs/common";

const isDebug = process.env.DEBUG === "true";

export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    const tenantId = request.tenantId ?? request.headers["x-tenant-id"] ?? null;
    if (isDebug) {
      console.log(
        "TenantId decorator: request.tenantId:",
        request.tenantId,
        "header:",
        request.headers["x-tenant-id"],
        "result:",
        tenantId,
      );
    }
    return tenantId;
  },
);
