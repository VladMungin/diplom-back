import { Injectable, Logger } from '@nestjs/common'
import { copyFileSync, existsSync, writeFileSync } from 'fs'
import { join } from 'path'
import { GoogleDriveService } from './google-drive.service'
import { ScheduleService } from './schedule.service'

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name)
  private readonly dbPath = join(__dirname, '..', '..', 'data', 'database.db')
  private readonly backupPath = join(__dirname, '..', '..', 'data', 'backup.db')
  private readonly folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

  constructor(
    private readonly googleDriveService: GoogleDriveService,
    private readonly scheduleService: ScheduleService
  ) {
    setTimeout(() => this.scheduleBackup(), 10000)
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

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const dbStats = require('fs').statSync(this.dbPath)
      if (dbStats.size === 0) {
        this.logger.warn('Database file is empty')
        return
      }

      const filesToCopy = [this.dbPath, `${this.dbPath}-wal`, `${this.dbPath}-shm`]
      for (const file of filesToCopy) {
        if (existsSync(file)) {
          const backupFile = file.replace(this.dbPath, this.backupPath)
          copyFileSync(file, backupFile)
          this.logger.log(`Copied ${file} to ${backupFile}`)
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const backupStats = require('fs').statSync(this.backupPath)
      if (backupStats.size === 0) {
        this.logger.error('Backup file is empty')
        return
      }

      const fileName = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.db`
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
        this.logger.warn('No files found in Google Drive, initializing new database')
        writeFileSync(this.dbPath, '')
        await this.runPrismaMigrations()
        return
      }
      const { filePath } = result
      copyFileSync(filePath, this.dbPath)
      this.logger.log('Database restored from Google Drive')
      await this.runPrismaMigrations()
    } catch (error) {
      this.logger.error('Database restoration failed', error.stack)
      throw error
    }
  }

  private async runPrismaMigrations() {
    try {
      this.logger.log('Applying Prisma migrations')
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { execSync } = require('child_process')
      execSync('npx prisma migrate deploy', { stdio: 'inherit' })
      this.logger.log('Prisma migrations applied successfully')
    } catch (error) {
      this.logger.error('Failed to apply Prisma migrations', error.stack)
      throw error
    }
  }
}
