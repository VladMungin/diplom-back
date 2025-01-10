import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { TypeOfTaskController } from './type_of_task.controller'
import { TypeOfTaskService } from './type_of_task.service'

@Module({
  controllers: [TypeOfTaskController],
  providers: [TypeOfTaskService, PrismaService],
})
export class TypeOfTaskModule {}
