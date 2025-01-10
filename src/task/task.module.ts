import { Module } from '@nestjs/common'
import { CompanyService } from 'src/company/company.service'
import { EmployeeService } from 'src/emplyee/employee.service'
import { PrismaService } from 'src/prisma.service'
import { RoleService } from 'src/role/role.service'
import { SpecializationService } from 'src/specialization/specialization.service'
import { UserService } from 'src/user/user.service'
import { TaskController } from './task.controller'
import { TaskService } from './task.service'

@Module({
  controllers: [TaskController],
  providers: [
    TaskService,
    PrismaService,
    EmployeeService,
    UserService,
    RoleService,
    SpecializationService,
    CompanyService,
  ],
})
export class TaskModule {}
