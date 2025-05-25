import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { TimeLogController } from './time-log.controller'
import { TimeLogService } from './time-log.service'

@Module({
  controllers: [TimeLogController],
  providers: [TimeLogService, PrismaService],
})
export class TimeLogModule {}
