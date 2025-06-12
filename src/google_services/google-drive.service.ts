import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as fs from 'fs'
import { google } from 'googleapis'
import * as path from 'path'

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name)
  private drive

  constructor(private configService: ConfigService) {
    const credentialsPath = this.configService.get('GOOGLE_SERVICE_ACCOUNT_PATH')

    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/drive'],
    })

    this.drive = google.drive({
      version: 'v3',
      auth,
    })
  }

  async uploadFile(filePath: string, fileName: string): Promise<string> {
    try {
      const folderId = this.configService.get('GOOGLE_DRIVE_FOLDER_ID')

      const fileMetadata = {
        name: fileName,
        parents: [folderId],
      }

      const media = {
        mimeType: 'application/x-sqlite3',
        body: fs.createReadStream(filePath),
      }

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id',
      })

      this.logger.log(`File uploaded successfully. ID: ${response.data.id}`)
      return response.data.id
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`)
      throw error
    }
  }

  async downloadLatestBackup(): Promise<string | null> {
    try {
      const folderId = this.configService.get('GOOGLE_DRIVE_FOLDER_ID')

      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and mimeType='application/x-sqlite3'`,
        fields: 'files(id, name, createdTime)',
        orderBy: 'createdTime desc',
      })

      const files = response.data.files
      if (!files || files.length === 0) {
        this.logger.log('No backup files found')
        return null
      }

      const latestFile = files[0]
      const backupPath = path.join(
        this.configService.get('DATABASE_PATH').split('database.db')[0],
        `backup-${Date.now()}.db`
      )

      const dest = fs.createWriteStream(backupPath)
      await this.drive.files.get({ fileId: latestFile.id, alt: 'media' }, { responseType: 'stream' }).then(res => {
        return new Promise((resolve, reject) => {
          res.data
            .pipe(dest)
            .on('finish', () => resolve(backupPath))
            .on('error', reject)
        })
      })

      this.logger.log(`Latest backup downloaded: ${latestFile.name}`)
      return backupPath
    } catch (error) {
      this.logger.error(`Failed to download backup: ${error.message}`)
      return null
    }
  }

  async listFiles(): Promise<{ id: string; name: string; createdTime: string }[]> {
    try {
      const folderId = this.configService.get('GOOGLE_DRIVE_FOLDER_ID')

      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and mimeType='application/x-sqlite3'`,
        fields: 'files(id, name, createdTime)',
        orderBy: 'createdTime desc',
      })

      const files = response.data.files || []
      this.logger.log(`Found ${files.length} backup files in Google Drive`)
      return files
    } catch (error) {
      this.logger.error(`Failed to list files: ${error.message}`)
      throw error
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({ fileId })
      this.logger.log(`File with ID ${fileId} deleted successfully`)
    } catch (error) {
      this.logger.error(`Failed to delete file with ID ${fileId}: ${error.message}`)
      throw error
    }
  }
}
