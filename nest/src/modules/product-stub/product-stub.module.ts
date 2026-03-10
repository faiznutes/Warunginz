import { Module } from "@nestjs/common";
import { ProductStubController } from "./product-stub.controller";

@Module({
  controllers: [ProductStubController],
})
export class ProductStubModule {}
