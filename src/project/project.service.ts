import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateProjectDto) {
    const { name, description, companyId, userId, employeeIds } = dto

    return this.prisma.project.create({
      data: {
        name,
        description,
        companyId,
        userId,
        employees: {
          connect: employeeIds.map(id => ({ id })),
        },
      },
    })
  }

  findAll(userId: string) {
    return this.prisma.project.findMany({
      where: {
        userId,
      },
    })
  }

  findOne(id: string) {
    return this.prisma.project.findUnique({
      where: {
        id,
      },
    })
  }

  async update(id: string, dto: UpdateProjectDto) {
    const oldProject = await this.prisma.project.findUnique({
      where: {
        id,
      },
    })

    return this.prisma.project.update({
      where: {
        id,
      },
      data: {
        ...oldProject,
        ...dto,
      },
    })
  }

  remove(id: string) {
    this.prisma.project.delete({
      where: {
        id,
      },
    })
    return true
  }
}
