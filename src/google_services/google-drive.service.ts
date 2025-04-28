import { Injectable, Logger } from '@nestjs/common'
import { createReadStream, existsSync, readFileSync } from 'fs'
import { google } from 'googleapis'
import { join } from 'path'

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name)
  private drive

  constructor() {
    this.initializeDrive()
  }

  private async initializeDrive() {
    try {
      const credentialsPath = join(process.cwd(), 'credentials.json')
      if (!existsSync(credentialsPath)) {
        throw new Error(
          'credentials.json not found. Please create a Service Account in Google Cloud Console and place the JSON key file as credentials.json in the project root.'
        )
      }
      const credentials = JSON.parse(readFileSync(credentialsPath, 'utf-8'))
      this.logger.log(`Credentials loaded: client_email=${credentials.client_email || 'missing'}`)
      if (!credentials.client_email) {
        throw new Error(
          'client_email field missing in credentials.json. Ensure you are using a valid Service Account JSON key.'
        )
      }
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      })
      this.drive = google.drive({ version: 'v3', auth })
      this.logger.log('Google Drive API initialized')
    } catch (error) {
      this.logger.error('Failed to initialize Google Drive API', error.stack)
      throw error
    }
  }

  async uploadFile(filePath: string, fileName: string, folderId: string) {
    try {
      if (!existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`)
      }
      const fileMetadata = {
        name: fileName,
        parents: [folderId],
      }
      const media = {
        mimeType: 'application/x-sqlite3',
        body: createReadStream(filePath),
      }
      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id',
      })
      this.logger.log(`File uploaded to Google Drive: ${fileName}, ID: ${response.data.id}`)
      return response.data.id
    } catch (error) {
      this.logger.error(`Failed to upload file ${fileName}`, error.stack)
      throw error
    }
  }

  async downloadLatestFile(folderId: string): Promise<{ filePath: string; fileName: string } | null> {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, createdTime)',
        orderBy: 'createdTime desc',
      })
      const files = response.data.files
      if (!files || files.length === 0) {
        this.logger.warn(`No files found in Google Drive folder with ID: ${folderId}`)
        return null
      }
      const latestFile = files[0]
      const filePath = join(process.cwd(), 'data', latestFile.name)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const dest = require('fs').createWriteStream(filePath)
      await this.drive.files.get({ fileId: latestFile.id, alt: 'media' }, { responseType: 'stream' }).then(res => {
        return new Promise((resolve, reject) => {
          res.data
            .on('end', () => resolve(filePath))
            .on('error', reject)
            .pipe(dest)
        })
      })
      this.logger.log(`Downloaded latest file: ${latestFile.name}`)
      return { filePath, fileName: latestFile.name }
    } catch (error) {
      this.logger.error('Failed to download latest file', error.stack)
      throw error
    }
  }
}
