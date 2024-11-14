import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { EmployeeModule } from './emplyee/employee.module'
import { ProjectModule } from './project/project.module'
import { UserModule } from './user/user.module'
@Module({
  imports: [ConfigModule.forRoot(), AuthModule, UserModule, ProjectModule, EmployeeModule],
})
export class AppModule {}
