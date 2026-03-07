import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
} from "@nestjs/common";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { ValidationException } from "../exceptions/custom-exceptions";

@Injectable()
export class EnhancedValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    // Skip validation for query params, header params, or when metatype is undefined
    if (!metadata.type || !metadata.metatype || metadata.type === "param") {
      return value;
    }

    // Skip validation for primitive types (string, number, boolean)
    const metatypeName = metadata.metatype?.name;
    if (
      metatypeName &&
      ["String", "Number", "Boolean", "Object"].includes(metatypeName)
    ) {
      return value;
    }

    try {
      const object = plainToInstance(metadata.metatype, value);
      const errors = await validate(object);

      if (errors.length > 0) {
        const fieldErrors = errors.map((error) => ({
          field: error.property,
          message: error.constraints
            ? Object.values(error.constraints).join(", ")
            : "Validation failed",
        }));

        throw new ValidationException("Input validation failed", fieldErrors);
      }
    } catch (error) {
      // Re-throw ValidationException but skip other errors
      if (error instanceof ValidationException) {
        throw error;
      }
    }

    return value;
  }
}
