import { Module } from '@nestjs/common'
import { EmployeeService } from './employee.service'
import { EmployeeController } from './employee.controller'
import { PrismaService } from 'src/prisma.service'
import { UserService } from 'src/user/user.service'

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService, PrismaService, UserService],
})
export class EmployeeModule {}
