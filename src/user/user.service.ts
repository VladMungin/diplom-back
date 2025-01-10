import { Injectable } from '@nestjs/common'
import { hash } from 'argon2'
import { AuthDto } from 'src/auth/dto/auth.dto'
import { CompanyService } from 'src/company/company.service'
import { PrismaService } from 'src/prisma.service'
import { RoleService } from 'src/role/role.service'

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private company: CompanyService,
    private role: RoleService
  ) {}

  async getById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        company: true,
        createdEmployee: true,
        projects: true,
      },
    })
  }

  async getByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email: email,
      },
    })
  }

  async create(dto: AuthDto) {
    const user = {
      email: dto.email,
      name: dto.name,
      password: await hash(dto.password),
    }

    const company = await this.company.create({
      name: dto.companyName,
    })

    const role = await this.role.create({
      name: 'Admin',
      canEditEmployee: true,
      canEditProject: true,
      canEditTask: true,
      canEditSpecialization: true,
      canEditRole: true,
    })

    return this.prisma.user.create({
      data: {
        ...user,
        companyId: company.id,
        roleId: role.id,
      },
    })
  }

  async update(id: string, dto: AuthDto) {
    const user = {
      email: dto.email,
      name: dto.name,
      password: await hash(dto.password),
    }
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        ...user,
      },
    })
  }

  // async createEmployee(dto: AuthDto, userId: string) {
  //   const user = {
  //     email: dto.email,
  //     name: '',
  //     password: await hash(dto.password),
  //   }

  //   return this.prisma.user.create({
  //     data: {
  //       role: 'employee',
  //       ...user,
  //     },
  //   })
  // }
}
