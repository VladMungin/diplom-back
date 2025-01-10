import { Module } from '@nestjs/common'
import { CompanyService } from 'src/company/company.service'
import { PrismaService } from 'src/prisma.service'
import { RoleService } from 'src/role/role.service'
import { SpecializationService } from 'src/specialization/specialization.service'
import { UserService } from 'src/user/user.service'
import { EmployeeController } from './employee.controller'
import { EmployeeService } from './employee.service'

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService, PrismaService, UserService, RoleService, SpecializationService, CompanyService],
})
export class EmployeeModule {}
