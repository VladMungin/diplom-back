import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaClient } from '@prisma/client'
import { existsSync, statSync } from 'fs'
import { GoogleDriveService } from './google-drive.service'

@Injectable()
export class BackupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BackupService.name)
  private readonly databasePath: string
  private readonly folderId: string
  private readonly prisma: PrismaClient

  constructor(
    private readonly googleDriveService: GoogleDriveService,
    private readonly configService: ConfigService
  ) {
    this.databasePath = this.configService.get<string>('DATABASE_PATH', '/app/data/database.db')
    this.folderId = this.configService.get<string>('GOOGLE_DRIVE_FOLDER_ID')
    this.prisma = new PrismaClient()
    if (!this.folderId) {
      throw new Error('GOOGLE_DRIVE_FOLDER_ID не указан в переменных окружения')
    }
    if (!existsSync(this.databasePath)) {
      this.logger.warn(`Файл базы данных не найден по пути ${this.databasePath}. Он будет создан при первой записи.`)
    } else {
      const stats = statSync(this.databasePath)
      this.logger.log(`Файл базы данных найден, размер: ${stats.size} байт`)
    }
  }

  async onApplicationBootstrap() {
    this.logger.log('Проверка наличия бэкапа на Google Диске...')
    try {
      const latestBackup = await this.googleDriveService.downloadLatestFile(this.folderId)
      if (latestBackup) {
        this.logger.log(`Найден существующий бэкап: ${latestBackup.fileName}`)
      } else {
        this.logger.warn('Бэкап на Google Диске не найден. Создается начальный бэкап...')
        await this.createBackup()
      }
    } catch (error) {
      this.logger.error('Не удалось проверить или создать начальный бэкап', error.stack)
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'database-backup' })
  async handleBackup() {
    this.logger.log('Запуск запланированного бэкапа...')
    try {
      await this.createBackup()
    } catch (error) {
      this.logger.error('Запланированный бэкап не удался', error.stack)
    }
  }

  private async createBackup() {
    function safeStringify(obj: any): string {
      return JSON.stringify(obj, (_, value) => (typeof value === 'bigint' ? value.toString() : value))
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFileName = `backup-${timestamp}.db`

    try {
      const checkpointResult = await this.prisma.$queryRaw`PRAGMA wal_checkpoint(FULL);`
      this.logger.log(`Результат чекпоинта WAL: ${safeStringify(checkpointResult)}`)

      const stats = existsSync(this.databasePath) ? statSync(this.databasePath) : null
      if (!stats || stats.size === 0) {
        this.logger.warn(`Файл базы данных не найден или пуст по пути ${this.databasePath}`)
        return
      }

      // ===== User =====
      const userCount = await this.prisma.user.count()
      this.logger.log(`User: ${userCount}`)
      if (userCount > 0) {
        const users = await this.prisma.user.findMany({ take: 2, select: { id: true, email: true, name: true } })
        this.logger.log(`User samples: ${JSON.stringify(users, null, 2)}`)
      }

      // ===== Company =====
      const companyCount = await this.prisma.company.count()
      this.logger.log(`Company: ${companyCount}`)
      if (companyCount > 0) {
        const companies = await this.prisma.company.findMany({ take: 2, select: { id: true, name: true } })
        this.logger.log(`Company samples: ${JSON.stringify(companies, null, 2)}`)
      }

      // ===== Employee =====
      const employeeCount = await this.prisma.employee.count()
      this.logger.log(`Employee: ${employeeCount}`)
      if (employeeCount > 0) {
        const employees = await this.prisma.employee.findMany({
          take: 2,
          select: { id: true, fullName: true, email: true, phone: true },
        })
        this.logger.log(`Employee samples: ${JSON.stringify(employees, null, 2)}`)
      }

      // ===== Project =====
      const projectCount = await this.prisma.project.count()
      this.logger.log(`Project: ${projectCount}`)
      if (projectCount > 0) {
        const projects = await this.prisma.project.findMany({
          take: 2,
          select: { id: true, name: true, description: true },
        })
        this.logger.log(`Project samples: ${JSON.stringify(projects, null, 2)}`)
      }

      // ===== Task =====
      const taskCount = await this.prisma.task.count()
      this.logger.log(`Task: ${taskCount}`)
      if (taskCount > 0) {
        const tasks = await this.prisma.task.findMany({
          take: 2,
          select: { id: true, status: true, title: true, description: true },
        })
        this.logger.log(`Task samples: ${JSON.stringify(tasks, null, 2)}`)
      }

      // ===== Specialization =====
      const specializationCount = await this.prisma.specialization.count()
      this.logger.log(`Specialization: ${specializationCount}`)
      if (specializationCount > 0) {
        const specs = await this.prisma.specialization.findMany({ take: 2, select: { id: true, name: true } })
        this.logger.log(`Specialization samples: ${JSON.stringify(specs, null, 2)}`)
      }

      // ===== Role =====
      const roleCount = await this.prisma.role.count()
      this.logger.log(`Role: ${roleCount}`)
      if (roleCount > 0) {
        const roles = await this.prisma.role.findMany({ take: 2, select: { id: true, name: true } })
        this.logger.log(`Role samples: ${JSON.stringify(roles, null, 2)}`)
      }

      // ===== TypeOfTask =====
      const typeCount = await this.prisma.typeOfTask.count()
      this.logger.log(`TypeOfTask: ${typeCount}`)
      if (typeCount > 0) {
        const types = await this.prisma.typeOfTask.findMany({ take: 2, select: { id: true, name: true } })
        this.logger.log(`TypeOfTask samples: ${JSON.stringify(types, null, 2)}`)
      }

      const fileId = await this.googleDriveService.uploadFile(this.databasePath, backupFileName, this.folderId)
      this.logger.log(`Бэкап успешно создан: ${backupFileName}, ID файла: ${fileId}`)
    } catch (error) {
      this.logger.error(`Не удалось создать бэкап: ${backupFileName}`, error.stack)
      throw error
    } finally {
      await this.prisma.$disconnect()
    }
  }
}
