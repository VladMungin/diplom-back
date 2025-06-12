import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import * as fs from 'fs'
import * as path from 'path'
import { PrismaService } from '../prisma.service'
import { GoogleDriveService } from './google-drive.service'

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name)
  private isRestoring = false

  constructor(
    private googleDriveService: GoogleDriveService,
    private configService: ConfigService,
    private prismaService: PrismaService
  ) {}

  async onModuleInit() {
    await this.restoreFromBackup()
  }

  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'createBackup' })
  async createBackup() {
    if (this.isRestoring) return

    try {
      const dbPath = this.configService.get('DATABASE_PATH')
      const backupName = `backup-${new Date().toISOString()}.db`
      const backupPath = path.join(path.dirname(dbPath), backupName)

      const files = await this.googleDriveService.listFiles()
      if (files.length >= 5) {
        const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name))
        const filesToDelete = sortedFiles.slice(0, files.length - 4)
        for (const file of filesToDelete) {
          await this.googleDriveService.deleteFile(file.id)
          this.logger.log(`Deleted old backup file: ${file.name}`)
        }
      }

      fs.copyFileSync(dbPath, backupPath)
      await this.googleDriveService.uploadFile(backupPath, backupName)
      fs.unlinkSync(backupPath)

      this.logger.log('Backup created and uploaded successfully')
    } catch (error) {
      this.logger.error(`Backup failed: ${error.message}`)
    }
  }

  async restoreFromBackup() {
    this.isRestoring = true
    try {
      const dbPath = this.configService.get('DATABASE_PATH')
      const dbDir = path.dirname(dbPath)

      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
      }

      const backupPath = await this.googleDriveService.downloadLatestBackup()

      if (backupPath) {
        fs.copyFileSync(backupPath, dbPath)
        fs.unlinkSync(backupPath)
        this.logger.log('Database restored from backup')
      } else {
        if (!fs.existsSync(dbPath)) {
          fs.writeFileSync(dbPath, '')
          await this.prismaService.$executeRaw`VACUUM`
          await this.googleDriveService.uploadFile(dbPath, `initial-backup-${new Date().toISOString()}.db`)
          this.logger.log('New database created and uploaded')
        }
      }

      await this.prismaService.$executeRaw`PRAGMA foreign_keys = ON`
      this.logger.log('Applying database migrations...')

      await this.logTableData()
    } catch (error) {
      this.logger.error(`Restore failed: ${error.message}`)
    } finally {
      this.isRestoring = false
    }
  }

  private async logTableData() {
    try {
      this.logger.log('Logging data from database tables...')

      const users = await this.prismaService.user.findMany()
      this.logger.log(`Users (${users.length}): ${JSON.stringify(users, null, 2)}`)

      const companies = await this.prismaService.company.findMany()
      this.logger.log(`Companies (${companies.length}): ${JSON.stringify(companies, null, 2)}`)

      const employees = await this.prismaService.employee.findMany()
      this.logger.log(`Employees (${employees.length}): ${JSON.stringify(employees, null, 2)}`)

      const projects = await this.prismaService.project.findMany()
      this.logger.log(`Projects (${projects.length}): ${JSON.stringify(projects, null, 2)}`)

      try {
        const tasks = await this.prismaService.task.findMany({
          include: { createdBy: true, employee: true, project: true, specialization: true, type: true },
        })
        this.logger.log(`Tasks (${tasks.length}): ${JSON.stringify(tasks, null, 2)}`)
      } catch (taskError) {
        this.logger.error(`Failed to fetch tasks: ${taskError.message}`)
      }

      const specializations = await this.prismaService.specialization.findMany()
      this.logger.log(`Specializations (${specializations.length}): ${JSON.stringify(specializations, null, 2)}`)

      const roles = await this.prismaService.role.findMany()
      this.logger.log(`Roles (${roles.length}): ${JSON.stringify(roles, null, 2)}`)

      const typesOfTask = await this.prismaService.typeOfTask.findMany()
      this.logger.log(`TypesOfTask (${typesOfTask.length}): ${JSON.stringify(typesOfTask, null, 2)}`)

      this.logger.log('Table data logging completed.')
    } catch (error) {
      this.logger.error(`Failed to log table data: ${error.message}`)
    }
  }
}
