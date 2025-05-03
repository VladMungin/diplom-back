import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { AuthModule } from './auth/auth.module'
import { EmployeeModule } from './emplyee/employee.module'
import { BackupModule } from './google_services/backup.module'
import { PrismaModule } from './prisma.module'
import { ProjectModule } from './project/project.module'
import { RoleModule } from './role/role.module'
import { SpecializationModule } from './specialization/specialization.module'
import { TaskModule } from './task/task.module'
import { TypeOfTaskModule } from './type_of_task/type_of_task.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UserModule,
    ProjectModule,
    TaskModule,
    EmployeeModule,
    SpecializationModule,
    RoleModule,
    TypeOfTaskModule,
    BackupModule,
    PrismaModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
