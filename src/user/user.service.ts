import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { hash } from 'argon2'
import { AuthDto } from 'src/auth/dto/auth.dto'
import { CompanyService } from 'src/company/company.service'
import { PrismaService } from 'src/prisma.service'
import { RoleService } from 'src/role/role.service'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(
    private prisma: PrismaService,
    private company: CompanyService,
    private role: RoleService
  ) {}

  async getById(id: string) {
    this.logger.log(`Поиск пользователя по ID: ${id}`)
    // Проверка существования таблицы User
    const tableExists = await this.prisma.$queryRaw<
      Array<{ name: string }>
    >`SELECT name FROM sqlite_master WHERE type='table' AND name='User';`
    if (!tableExists || tableExists.length === 0) {
      this.logger.error('Таблица User не существует в базе данных')
      throw new BadRequestException('База данных не инициализирована')
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        company: true,
        createdEmployee: true,
        projects: true,
      },
    })
    this.logger.log(`Пользователь ${id} ${user ? 'найден' : 'не найден'}`)
    return user
  }

  async getByEmail(email: string) {
    this.logger.log(`Поиск пользователя по email: ${email}`)
    // Проверка существования таблицы User
    const tableExists = await this.prisma.$queryRaw<
      Array<{ name: string }>
    >`SELECT name FROM sqlite_master WHERE type='table' AND name='User';`
    if (!tableExists || tableExists.length === 0) {
      this.logger.error('Таблица User не существует в базе данных')
      throw new BadRequestException('База данных не инициализирована')
    }

    const user = await this.prisma.user.findFirst({
      where: { email },
    })
    this.logger.log(`Пользователь с email ${email} ${user ? 'найден' : 'не найден'}`)
    return user
  }

  async create(dto: AuthDto) {
    this.logger.log(`Создание пользователя с email: ${dto.email}`)

    // Проверка наличия обязательных полей
    if (!dto.email || !dto.password || !dto.companyName) {
      this.logger.error(`Недостаточно данных в AuthDto: ${JSON.stringify(dto)}`)
      throw new BadRequestException('Необходимо указать email, password и companyName')
    }

    // Проверка существования таблицы User
    const tableExists = await this.prisma.$queryRaw<
      Array<{ name: string }>
    >`SELECT name FROM sqlite_master WHERE type='table' AND name='User';`
    if (!tableExists || tableExists.length === 0) {
      this.logger.error('Таблица User не существует в базе данных')
      throw new BadRequestException('База данных не инициализирована')
    }

    try {
      const user = {
        email: dto.email,
        name: dto.name || dto.email.split('@')[0],
        password: await hash(dto.password),
      }

      this.logger.log(`Создание компании с именем: ${dto.companyName}`)
      const company = await this.company.create({
        name: dto.companyName,
      })
      this.logger.log(`Компания создана, ID: ${company.id}`)

      // Теперь создаем роль, передавая userId
      this.logger.log(`Создание роли Admin для пользователя `)
      const role = await this.role.create({
        name: 'Admin',
        canEditEmployee: true,
        canEditProject: true,
        canEditTask: true,
        canEditSpecialization: true,
        canEditRole: true,
      })
      this.logger.log(`Роль создана, ID: ${role.id}`)

      // Сначала создаем пользователя без роли
      this.logger.log(`Создание пользователя с данными: ${JSON.stringify(user)}`)
      const createdUser = await this.prisma.user.create({
        data: {
          ...user,
          companyId: company.id,
          roleId: role.id,
        },
      })
      this.logger.log(`Пользователь успешно создан, ID: ${createdUser.id}, email: ${createdUser.email}`)

      // Обновляем Роль, устанавливая userId
      const updatedUser = await this.prisma.role.update({
        where: { id: createdUser.id },
        data: {
          userId: createdUser.id,
        },
      })

      return updatedUser
    } catch (error) {
      this.logger.error(`Ошибка при создании пользователя: ${error.message}`, error.stack)
      throw new BadRequestException(`Не удалось создать пользователя: ${error.message}`)
    }
  }

  async update(id: string, dto: AuthDto) {
    this.logger.log(`Обновление пользователя с ID: ${id}`)
    // Проверка существования таблицы User
    const tableExists = await this.prisma.$queryRaw<
      Array<{ name: string }>
    >`SELECT name FROM sqlite_master WHERE type='table' AND name='User';`
    if (!tableExists || tableExists.length === 0) {
      this.logger.error('Таблица User не существует в базе данных')
      throw new BadRequestException('База данных не инициализирована')
    }

    const user = {
      email: dto.email,
      name: dto.name,
      password: await hash(dto.password),
    }
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: { ...user },
      })
      this.logger.log(`Пользователь обновлен, ID: ${id}`)
      return updatedUser
    } catch (error) {
      this.logger.error(`Ошибка при обновлении пользователя: ${error.message}`, error.stack)
      throw new BadRequestException(`Не удалось обновить пользователя: ${error.message}`)
    }
  }
}
