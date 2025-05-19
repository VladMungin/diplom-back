import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateProjectDto) {
    const { name, description, userId, employeeIds } = dto

    return this.prisma.project.create({
      data: {
        name,
        description,
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
      include: {
        employees: {
          include: {
            specialization: true,
          },
        },
        tasks: {
          include: {
            type: true,
          },
        },
      },
    })
  }

  async update(id: string, dto: UpdateProjectDto) {
    const { employeeIds, ...rest } = dto

    const existingProject = await this.prisma.project.findUnique({
      where: { id },
    })

    if (!existingProject) {
      throw new Error('Project not found')
    }

    const updateData: any = { ...rest }

    if (employeeIds) {
      updateData.employees = {
        set: employeeIds.map(id => ({ id })),
      }
    }

    return this.prisma.project.update({
      where: { id },
      data: updateData,
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
