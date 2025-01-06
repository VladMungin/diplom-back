import { Module } from '@nestjs/common'
import { EmployeeService } from 'src/emplyee/employee.service'
import { PrismaService } from 'src/prisma.service'
import { TaskController } from './task.controller'
import { TaskService } from './task.service'

@Module({
  controllers: [TaskController],
  providers: [TaskService, PrismaService, EmployeeService],
})
export class TaskModule {}
