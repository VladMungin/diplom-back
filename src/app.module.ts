import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { TasksModule } from './tasks/tasks.module';
@Module({
  imports: [ConfigModule.forRoot(), AuthModule, UserModule, TasksModule],
})
export class AppModule {}
