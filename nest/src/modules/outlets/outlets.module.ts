import { Module } from '@nestjs/common';
import { OutletsController } from './outlets.controller';
import { OutletsService } from './outlets.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AddonModule } from '../addon/addon.module';

@Module({
  imports: [PrismaModule, AddonModule],
  controllers: [OutletsController],
  providers: [OutletsService],
  exports: [OutletsService],
})
export class OutletsModule {}
