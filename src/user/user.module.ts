import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { CompanyService } from 'src/company/company.service'
import { RoleService } from 'src/role/role.service'

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, CompanyService, RoleService],
  exports: [UserService],
})
export class UserModule {}
