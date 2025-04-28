import { Injectable, Logger } from '@nestjs/common'
import { copyFileSync, existsSync, writeFileSync } from 'fs'
import { join } from 'path'
import { GoogleDriveService } from './google-drive.service'
import { ScheduleService } from './schedule.service'

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name)
  private readonly dbPath = join(process.cwd(), 'data', 'database.sqlite')
  private readonly backupPath = join(process.cwd(), 'data', 'backup.sqlite')
  private readonly folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

  constructor(
    private readonly googleDriveService: GoogleDriveService,
    private readonly scheduleService: ScheduleService
  ) {
    this.scheduleBackup()
  }

  private scheduleBackup() {
    this.scheduleService.scheduleJob('backup', '*/5 * * * *', async () => {
      await this.createBackup()
    })
    this.logger.log('Backup scheduled every 5 minutes')
  }

  async createBackup() {
    try {
      if (!existsSync(this.dbPath)) {
        this.logger.warn('Database file does not exist')
        return
      }
      this.logger.log(`Copying ${this.dbPath} to ${this.backupPath}`)
      copyFileSync(this.dbPath, this.backupPath)
      if (!existsSync(this.backupPath)) {
        this.logger.error(`Failed to create backup file: ${this.backupPath}`)
        return
      }
      const fileName = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`
      this.logger.log(`Uploading backup: ${fileName}`)
      await this.googleDriveService.uploadFile(this.backupPath, fileName, this.folderId)
      this.logger.log(`Backup created and uploaded: ${fileName}`)
    } catch (error) {
      this.logger.error('Backup failed', error.stack)
    }
  }

  async restoreDatabase() {
    try {
      const result = await this.googleDriveService.downloadLatestFile(this.folderId)
      if (!result) {
        this.logger.warn('No files found in Google Drive, creating empty SQLite database')
        writeFileSync(this.dbPath, '')
        return
      }
      const { filePath } = result
      copyFileSync(filePath, this.dbPath)
      this.logger.log('Database restored from Google Drive')
    } catch (error) {
      this.logger.error('Database restoration failed', error.stack)
      throw error
    }
  }
}
