import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { BackupService } from './backup.service'
import { GoogleDriveService } from './google-drive.service'

@Module({
  imports: [ConfigModule, ScheduleModule.forRoot()],
  providers: [GoogleDriveService, BackupService],
  exports: [BackupService],
})
export class BackupModule {}
