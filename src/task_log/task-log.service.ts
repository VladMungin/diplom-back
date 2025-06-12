// task-log.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { ACTION_ENUM } from './dto/__constants'
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

    const taskLog = await this.prisma.taskLog.create({
      data: {
        taskId: createTaskLogDto.taskId,
        employeeId: createTaskLogDto.employeeId,
        hoursWorked: createTaskLogDto.hoursWorked || 0,
        action: ACTION_ENUM.CREATE,
      },
      include: {
        task: true,
        employee: true,
      },
    })

    if (createTaskLogDto.hoursWorked) {
      await this.prisma.task.update({
        where: { id: createTaskLogDto.taskId },
        data: {
          currentTime: { increment: Math.round(createTaskLogDto.hoursWorked) },
        },
      })
    }

    return taskLog
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

    const taskLog = await this.prisma.taskLog.create({
      data: {
        taskId,
        employeeId,
        hoursWorked: 0,
        action: ACTION_ENUM.CHANGE_EMPLOYEE,
      },
      include: {
        task: true,
        employee: true,
      },
    })

    await this.prisma.task.update({
      where: { id: taskId },
      data: {
        employeeId,
      },
    })

    return taskLog
  }

  async findAll() {
    return this.prisma.taskLog.findMany({
      include: {
        task: true,
        employee: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async findByTaskId(taskId: number) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } })
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`)
    }

    return this.prisma.taskLog.findMany({
      where: { taskId },
      include: {
        task: true,
        employee: true,
      },
      orderBy: {
        createdAt: 'desc',
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

  async findOneByTaskId(taskId: number) {
    const taskLog = await this.prisma.taskLog.findFirst({
      where: { taskId },
      include: {
        task: true,
        employee: true,
      },
    })
    if (!taskLog) {
      throw new NotFoundException(`TaskLog с taskId ${taskId} не найден`)
    }
    return taskLog
  }

  async update(id: string, updateTaskLogDto: UpdateTaskLogDto, action: string) {
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

    let timeDiff = 0
    if (updateTaskLogDto.hoursWorked !== undefined && taskLog.hoursWorked !== null) {
      timeDiff = (updateTaskLogDto.hoursWorked || 0) - (taskLog.hoursWorked || 0)
    } else if (updateTaskLogDto.hoursWorked && taskLog.hoursWorked === null) {
      timeDiff = updateTaskLogDto.hoursWorked
    } else if (updateTaskLogDto.hoursWorked === null && taskLog.hoursWorked !== null) {
      timeDiff = -taskLog.hoursWorked
    }

    if (timeDiff !== 0) {
      await this.prisma.task.update({
        where: { id: taskId },
        data: {
          currentTime: { increment: Math.round(timeDiff) },
        },
      })
    }

    if (updateTaskLogDto.employeeId && updateTaskLogDto.employeeId !== taskLog.employeeId) {
      await this.prisma.taskLog.create({
        data: {
          taskId,
          employeeId: updateTaskLogDto.employeeId,
          hoursWorked: updateTaskLogDto.hoursWorked || 0,
          action,
        },
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

  async getTaskLogByEmployee(employeeId: string, month: number) {
    const taskLogs = await this.prisma.taskLog.findMany({
      where: {
        employeeId: employeeId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), month - 1, 1),
          lte: new Date(new Date().getFullYear(), month, 0),
        },
      },
      include: {
        task: true,
        employee: true,
      },
    })
    return taskLogs
  }
}
