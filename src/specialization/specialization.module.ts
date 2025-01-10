import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { SpecializationController } from './specialization.controller'
import { SpecializationService } from './specialization.service'

@Module({
  controllers: [SpecializationController],
  providers: [SpecializationService, PrismaService],
})
export class SpecializationModule {}
