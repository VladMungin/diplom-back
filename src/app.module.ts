import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { EmployeeModule } from './emplyee/employee.module'
import { ProjectModule } from './project/project.module'
import { TaskModule } from './task/task.module'
import { UserModule } from './user/user.module'
import { SpecializationModule } from './specialization/specialization.module';
import { RoleModule } from './role/role.module';
import { TypeOfTaskModule } from './type_of_task/type_of_task.module';
@Module({
  imports: [ConfigModule.forRoot(), AuthModule, UserModule, ProjectModule, TaskModule, EmployeeModule, SpecializationModule, RoleModule, TypeOfTaskModule],
})
export class AppModule {}
