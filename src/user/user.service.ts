import { Injectable } from '@nestjs/common'
import { hash } from 'argon2'
import { AuthDto } from 'src/auth/dto/auth.dto'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.user.create({
      data: {
        ...user,
        company: {
          // connect:
        },
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
