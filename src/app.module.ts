import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { CompanyModule } from './company/company.module'
import { UserModule } from './user/user.module'
import { ProjectModule } from './project/project.module';
@Module({
<<<<<<< HEAD
  imports: [ConfigModule.forRoot(), AuthModule, UserModule, CompanyModule],
=======
  imports: [ConfigModule.forRoot(), AuthModule, UserModule, ProjectModule],
>>>>>>> aadd758135949ac074e786b9c704e5638e95a0ca
})
export class AppModule {}
