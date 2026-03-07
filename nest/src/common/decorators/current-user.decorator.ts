import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  id: string;
  tenantId: string | null;
  role: string;
  email: string;
  name: string;
  permissions?: Record<string, unknown>;
  assignedStoreId?: string | null;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext): CurrentUserPayload | unknown => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload;
    return data ? user?.[data] : user;
  },
);
