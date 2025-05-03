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
    // Проверка пути к базе данных при старте
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
      // Не выбрасываем ошибку, чтобы приложение продолжило работу
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
      // Принудительная фиксация изменений в SQLite
      const checkpointResult = await this.prisma.$queryRaw`PRAGMA wal_checkpoint(FULL);`
      this.logger.log(`Результат чекпоинта WAL: ${safeStringify(checkpointResult)}`)

      // Проверка существования таблицы User
      const tableExists = await this.prisma.$queryRaw<
        Array<{ name: string }>
      >`SELECT name FROM sqlite_master WHERE type='table' AND name='User';`
      if (!tableExists || tableExists.length === 0) {
        this.logger.warn('Таблица User не существует в базе данных')
        return
      }

      // Проверка записей в таблицах User, Company, Role
      const userCount = await this.prisma.user.count()
      const companyCount = await this.prisma.company.count()
      const roleCount = await this.prisma.role.count()
      this.logger.log(`Записей в таблице User: ${userCount}, Company: ${companyCount}, Role: ${roleCount}`)

      // Логирование примеров записей
      if (userCount > 0) {
        const users = await this.prisma.user.findMany({
          take: 2,
          select: { id: true, email: true, name: true },
        })
        this.logger.log(`Пример записей в User: ${JSON.stringify(users, null, 2)}`)
      }
      if (companyCount > 0) {
        const companies = await this.prisma.company.findMany({
          take: 2,
          select: { id: true, name: true },
        })
        this.logger.log(`Пример записей в Company: ${JSON.stringify(companies, null, 2)}`)
      }
      if (roleCount > 0) {
        const roles = await this.prisma.role.findMany({
          take: 2,
          select: { id: true, name: true },
        })
        this.logger.log(`Пример записей в Role: ${JSON.stringify(roles, null, 2)}`)
      }

      // Проверка существования и размера файла базы данных
      if (!existsSync(this.databasePath)) {
        this.logger.warn(`Файл базы данных не найден по пути ${this.databasePath}. Пропуск создания бэкапа.`)
        return
      }
      const stats = statSync(this.databasePath)
      this.logger.log(`Размер файла базы данных: ${stats.size} байт`)
      if (stats.size === 0) {
        this.logger.warn(`Файл базы данных по пути ${this.databasePath} пуст`)
        return
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
