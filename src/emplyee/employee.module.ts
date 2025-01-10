import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { RoleService } from 'src/role/role.service'
import { UserService } from 'src/user/user.service'
import { EmployeeController } from './employee.controller'
import { EmployeeService } from './employee.service'
import { SpecializationService } from 'src/specialization/specialization.service'

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService, PrismaService, UserService, RoleService, SpecializationService],
})
export class EmployeeModule {}
