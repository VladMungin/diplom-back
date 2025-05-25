import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateTimeLogDto } from './dto/create-time-log.dto'
import { UpdateTimeLogDto } from './dto/update-time-log.dto'

@Injectable()
export class TimeLogService {
  constructor(private prisma: PrismaService) {}

  async create(createTimeLogDto: CreateTimeLogDto) {
    return this.prisma.timeLog.create({
      data: {
        taskId: createTimeLogDto.taskId,
        employeeId: createTimeLogDto.employeeId,
        hoursWorked: createTimeLogDto.hoursWorked,
        description: createTimeLogDto.description,
      },
      include: {
        task: true,
        employee: true,
      },
    })
  }

  async findAll() {
    return this.prisma.timeLog.findMany({
      include: {
        task: true,
        employee: true,
      },
    })
  }

  async findOne(id: string) {
    const timeLog = await this.prisma.timeLog.findUnique({
      where: { id },
      include: {
        task: true,
        employee: true,
      },
    })
    if (!timeLog) {
      throw new NotFoundException(`TimeLog with ID ${id} not found`)
    }
    return timeLog
  }

  async update(id: string, updateTimeLogDto: UpdateTimeLogDto) {
    const timeLog = await this.prisma.timeLog.findUnique({ where: { id } })
    if (!timeLog) {
      throw new NotFoundException(`TimeLog with ID ${id} not found`)
    }
    return this.prisma.timeLog.update({
      where: { id },
      data: {
        taskId: updateTimeLogDto.taskId,
        employeeId: updateTimeLogDto.employeeId,
        hoursWorked: updateTimeLogDto.hoursWorked,
        description: updateTimeLogDto.description,
      },
      include: {
        task: true,
        employee: true,
      },
    })
  }

  async remove(id: string) {
    const timeLog = await this.prisma.timeLog.findUnique({ where: { id } })
    if (!timeLog) {
      throw new NotFoundException(`TimeLog with ID ${id} not found`)
    }
    return this.prisma.timeLog.delete({
      where: { id },
    })
  }
}
