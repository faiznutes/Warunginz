import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Request } from "express";
import {
  SuccessResponseDto,
  ResponseCode,
  PaginatedResponseDto,
} from "../dto/response.dto";
import { EXCLUDE_INTERCEPTOR_KEY } from "../decorators/exclude-interceptor.decorator";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  correlationId?: string;
  code?: ResponseCode;
  timestamp?: string;
  path?: string;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const correlationId = (request as any).correlationId;
    const path = request.url || "";
    const method = request.method;

    const excludePaths = [
      "/api/products",
      "/api/subscriptions",
      "/api/payments",
      "/api/orders",
      "/api/reports",
      "/api/analytics",
    ];
    const shouldExclude = excludePaths.some((p) => path.startsWith(p));

    const isExcluded =
      shouldExclude ||
      Reflect.getMetadata(EXCLUDE_INTERCEPTOR_KEY, context.getHandler()) ||
      Reflect.getMetadata(EXCLUDE_INTERCEPTOR_KEY, context.getClass());

    if (isExcluded) {
      return next.handle().pipe(
        map((data) => {
          return data as any;
        }),
      );
    }

    return next.handle().pipe(
      map((data) => {
        // If already a properly formatted response with success flag, return as-is with correlation
        if (
          data &&
          typeof data === "object" &&
          "success" in data &&
          "code" in data
        ) {
          return { ...data, correlationId } as ApiResponse<T>;
        }

        // If response is paginated (has pagination property)
        if (data && typeof data === "object" && "pagination" in data) {
          const response = new PaginatedResponseDto(
            data.data || [],
            data.pagination,
            path,
          );
          return { ...response, correlationId } as unknown as ApiResponse<T>;
        }

        // For standard responses with data
        const code = this.getResponseCode(method);
        const message = this.getResponseMessage(code);

        const response = new SuccessResponseDto(code, message, data, path);

        return { ...response, correlationId } as ApiResponse<T>;
      }),
    );
  }

  private getResponseCode(method: string): ResponseCode {
    switch (method) {
      case "POST":
        return ResponseCode.CREATED;
      case "PUT":
        return ResponseCode.UPDATED;
      case "DELETE":
        return ResponseCode.DELETED;
      case "GET":
      default:
        return ResponseCode.SUCCESS;
    }
  }

  private getResponseMessage(code: ResponseCode): string {
    const messages: Record<ResponseCode, string> = {
      [ResponseCode.SUCCESS]: "Operation successful",
      [ResponseCode.CREATED]: "Resource created successfully",
      [ResponseCode.UPDATED]: "Resource updated successfully",
      [ResponseCode.DELETED]: "Resource deleted successfully",
      [ResponseCode.VALIDATION_ERROR]: "Validation error",
      [ResponseCode.UNAUTHORIZED]: "Unauthorized",
      [ResponseCode.FORBIDDEN]: "Forbidden",
      [ResponseCode.NOT_FOUND]: "Resource not found",
      [ResponseCode.CONFLICT]: "Resource conflict",
      [ResponseCode.RATE_LIMIT_EXCEEDED]: "Rate limit exceeded",
      [ResponseCode.INTERNAL_ERROR]: "Internal server error",
      [ResponseCode.SERVICE_UNAVAILABLE]: "Service unavailable",
    };

    return messages[code] || "Operation completed";
  }
}
