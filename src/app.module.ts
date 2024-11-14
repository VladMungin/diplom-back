import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { CompanyModule } from './company/company.module'
import { UserModule } from './user/user.module'
@Module({
  imports: [ConfigModule.forRoot(), AuthModule, UserModule, CompanyModule],
})
export class AppModule {}
