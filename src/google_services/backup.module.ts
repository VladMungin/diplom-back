import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaModule } from '../prisma.module'
import { BackupController } from './backup.controller'
import { BackupService } from './backup.service'
import { GoogleDriveService } from './google-drive.service'

@Module({
  imports: [ConfigModule, ScheduleModule.forRoot(), PrismaModule],
  controllers: [BackupController],
  providers: [GoogleDriveService, BackupService],
  exports: [BackupService],
})
export class BackupModule {}
