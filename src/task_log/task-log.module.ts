import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { TaskLogController } from './task-log.controller'
import { TaskLogService } from './task-log.service'

@Module({
  controllers: [TaskLogController],
  providers: [TaskLogService, PrismaService],
})
export class TimeLogModule {}
