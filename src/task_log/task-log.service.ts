import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateTaskLogDto } from './dto/create-task-log.dto'
import { UpdateTaskLogDto } from './dto/update-task-log.dto'

@Injectable()
export class TaskLogService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskLogDto: CreateTaskLogDto) {
    const task = await this.prisma.task.findUnique({ where: { id: createTaskLogDto.taskId } })
    if (!task) {
      throw new NotFoundException(`Task with ID ${createTaskLogDto.taskId} not found`)
    }
    const employee = await this.prisma.employee.findUnique({ where: { id: createTaskLogDto.employeeId } })
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${createTaskLogDto.employeeId} not found`)
    }

    const updateData: any = {
      employeeId: createTaskLogDto.employeeId,
    }
    if (createTaskLogDto.hoursWorked) {
      updateData.currentTime = { increment: Math.round(createTaskLogDto.hoursWorked) }
    }

    await this.prisma.task.update({
      where: { id: createTaskLogDto.taskId },
      data: updateData,
    })

    return this.prisma.taskLog.create({
      data: {
        taskId: createTaskLogDto.taskId,
        employeeId: createTaskLogDto.employeeId,
        hoursWorked: createTaskLogDto.hoursWorked,
      },
      include: {
        task: true,
        employee: true,
      },
    })
  }

  async assignEmployee(taskId: number, employeeId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } })
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`)
    }
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } })
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`)
    }

    await this.prisma.task.update({
      where: { id: taskId },
      data: {
        employeeId,
      },
    })

    return this.prisma.taskLog.create({
      data: {
        taskId,
        employeeId,
        hoursWorked: null,
      },
      include: {
        task: true,
        employee: true,
      },
    })
  }

  async findAll() {
    return this.prisma.taskLog.findMany({
      include: {
        task: true,
        employee: true,
      },
    })
  }

  async findOne(id: string) {
    const taskLog = await this.prisma.taskLog.findUnique({
      where: { id },
      include: {
        task: true,
        employee: true,
      },
    })
    if (!taskLog) {
      throw new NotFoundException(`TaskLog with ID ${id} not found`)
    }
    return taskLog
  }

  async update(id: string, updateTaskLogDto: UpdateTaskLogDto) {
    const taskLog = await this.prisma.taskLog.findUnique({ where: { id } })
    if (!taskLog) {
      throw new NotFoundException(`TaskLog with ID ${id} not found`)
    }

    let taskId = taskLog.taskId
    if (updateTaskLogDto.taskId) {
      const task = await this.prisma.task.findUnique({ where: { id: updateTaskLogDto.taskId } })
      if (!task) {
        throw new NotFoundException(`Task with ID ${updateTaskLogDto.taskId} not found`)
      }
      taskId = updateTaskLogDto.taskId
    }
    if (updateTaskLogDto.employeeId) {
      const employee = await this.prisma.employee.findUnique({ where: { id: updateTaskLogDto.employeeId } })
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${updateTaskLogDto.employeeId} not found`)
      }
    }

    const updateData: any = {}
    if (updateTaskLogDto.employeeId) {
      updateData.employeeId = updateTaskLogDto.employeeId
    }
    if (updateTaskLogDto.hoursWorked !== undefined && taskLog.hoursWorked !== null) {
      const timeDiff = (updateTaskLogDto.hoursWorked || 0) - (taskLog.hoursWorked || 0)
      updateData.currentTime = { increment: Math.round(timeDiff) }
    } else if (updateTaskLogDto.hoursWorked && taskLog.hoursWorked === null) {
      updateData.currentTime = { increment: Math.round(updateTaskLogDto.hoursWorked) }
    } else if (updateTaskLogDto.hoursWorked === null && taskLog.hoursWorked !== null) {
      updateData.currentTime = { decrement: Math.round(taskLog.hoursWorked) }
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.task.update({
        where: { id: taskId },
        data: updateData,
      })
    }

    return this.prisma.taskLog.update({
      where: { id },
      data: {
        taskId: updateTaskLogDto.taskId,
        employeeId: updateTaskLogDto.employeeId,
        hoursWorked: updateTaskLogDto.hoursWorked,
      },
      include: {
        task: true,
        employee: true,
      },
    })
  }

  async remove(id: string) {
    const taskLog = await this.prisma.taskLog.findUnique({ where: { id } })
    if (!taskLog) {
      throw new NotFoundException(`TaskLog with ID ${id} not found`)
    }

    if (taskLog.hoursWorked !== null) {
      await this.prisma.task.update({
        where: { id: taskLog.taskId },
        data: {
          currentTime: { decrement: Math.round(taskLog.hoursWorked) },
        },
      })
    }

    return this.prisma.taskLog.delete({
      where: { id },
    })
  }

  async getEmployeeIdsForTask(taskId: number) {
    const taskLogs = await this.prisma.taskLog.findMany({
      where: { taskId },
      select: { employeeId: true },
      distinct: ['employeeId'],
    })
    return taskLogs.map(log => log.employeeId)
  }
}
