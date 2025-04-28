import { Module } from '@nestjs/common'
import { BackupService } from './backup.service'
import { GoogleDriveService } from './google-drive.service'
import { ScheduleService } from './schedule.service'

@Module({
  providers: [GoogleDriveService, BackupService, ScheduleService],
  exports: [BackupService],
})
export class BackupModule {}
