// task.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { EmployeeService } from 'src/emplyee/employee.service'
import { ACTION_ENUM } from 'src/task_log/dto/__constants'
import { PrismaService } from './../prisma.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskEmployeeDto, UpdateTaskStatusDto, UpdateTaskTimeDto } from './dto/update-task.dto'

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly employee: EmployeeService
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    console.log('Получен createTaskDto:', createTaskDto)
    const { projectId, employeeId, specializationId, typeOfTaskId, autoSet, createdById, ...task } = createTaskDto

    if (!createdById) {
      throw new Error('createdById обязателен')
    }

    let employeeIdValue: string | null = null
    if (autoSet && specializationId) {
      const leastBusyEmployee = await this.employee.getLeastBusyEmployee(specializationId)
      employeeIdValue = leastBusyEmployee?.id ?? null
    } else {
      employeeIdValue = employeeId || null
    }

    // Проверяем существование сотрудника, если employeeIdValue указан
    if (employeeIdValue) {
      const employee = await this.prisma.employee.findUnique({ where: { id: employeeIdValue } })
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeIdValue} not found`)
      }
    }

    // Проверяем существование projectId, если указан
    if (projectId) {
      const project = await this.prisma.project.findUnique({ where: { id: projectId } })
      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`)
      }
    }

    // Проверяем существование specializationId и typeOfTaskId
    if (specializationId) {
      const specialization = await this.prisma.specialization.findUnique({ where: { id: specializationId } })
      if (!specialization) {
        throw new NotFoundException(`Specialization with ID ${specializationId} not found`)
      }
    }
    if (typeOfTaskId) {
      const typeOfTask = await this.prisma.typeOfTask.findUnique({ where: { id: typeOfTaskId } })
      if (!typeOfTask) {
        throw new NotFoundException(`TypeOfTask with ID ${typeOfTaskId} not found`)
      }
    }

    const taskCreated = await this.prisma.task.create({
      data: {
        ...task,
        timeToCompleat: task.timeToCompleat || 0,
        currentTime: task.currentTime || 0,
        status: task.status || 'PENDING',
        // Связываем отношения через connect
        createdBy: { connect: { id: createdById } },
        ...(projectId && { project: { connect: { id: projectId } } }),
        ...(employeeIdValue && {
          employee: { connect: { id: employeeIdValue } },
          Employee: { connect: { id: employeeIdValue } }, // Handle the second relation
        }),
        ...(specializationId && { specialization: { connect: { id: specializationId } } }),
        ...(typeOfTaskId && { type: { connect: { id: typeOfTaskId } } }),
      },
    })

    if (employeeIdValue) {
      await this.prisma.taskLog.create({
        data: {
          taskId: taskCreated.id,
          employeeId: employeeIdValue,
          hoursWorked: 0,
          action: ACTION_ENUM.CREATE,
        },
      })
    }

    return taskCreated
  }

  findAll(userId: string) {
    return this.prisma.task.findMany({
      where: {
        project: {
          userId,
        },
      },
      include: {
        project: true,
        specialization: true,
        type: true,
        employee: true,
        createdBy: true,
        taskLogs: true, // Добавляем историю изменений
      },
    })
  }

  findOne(id: number) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        employee: true,
        project: true,
        type: true,
        specialization: true,
        createdBy: true,
        taskLogs: {
          // Добавляем историю изменений
          include: {
            employee: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })
  }

  async updateStatus(id: number, updateTaskStatusDto: UpdateTaskStatusDto) {
    const { status } = updateTaskStatusDto

    const currentTask = await this.prisma.task.findUnique({ where: { id } })
    if (!currentTask) {
      throw new NotFoundException(`Task with ID ${id} not found`)
    }

    if (currentTask.employeeId) {
      await this.prisma.taskLog.create({
        data: {
          taskId: id,
          employeeId: currentTask.employeeId,
          action: ACTION_ENUM.CHANGE_STATUS,
        },
      })
    }

    return this.prisma.task.update({
      where: { id },
      data: { status },
      include: {
        taskLogs: {
          include: { employee: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  }

  async updateTime(id: number, updateTaskTimeDto: UpdateTaskTimeDto) {
    const { currentTime } = updateTaskTimeDto

    const currentTask = await this.prisma.task.findUnique({ where: { id } })
    if (!currentTask) {
      throw new NotFoundException(`Task with ID ${id} not found`)
    }

    if (currentTask.employeeId) {
      await this.prisma.taskLog.create({
        data: {
          taskId: id,
          employeeId: currentTask.employeeId,
          hoursWorked: Number(currentTime),
          action: ACTION_ENUM.CHANGE_TIME,
        },
      })
    }

    return this.prisma.task.update({
      where: { id },
      data: { currentTime: Number(currentTime) },
      include: {
        taskLogs: {
          include: { employee: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  }

  async updateEmployee(id: number, updateTaskEmployeeDto: UpdateTaskEmployeeDto) {
    const { employeeId, autoSet, specializationId } = updateTaskEmployeeDto

    const currentTask = await this.prisma.task.findUnique({ where: { id } })
    if (!currentTask) {
      throw new NotFoundException(`Task with ID ${id} not found`)
    }

    let employeeIdValue: string | null = null
    if (autoSet && specializationId) {
      const leastBusyEmployee = await this.employee.getLeastBusyEmployee(specializationId)
      employeeIdValue = leastBusyEmployee?.id ?? null
    } else if (employeeId) {
      employeeIdValue = employeeId
    }

    if (employeeIdValue) {
      const employee = await this.prisma.employee.findUnique({ where: { id: employeeIdValue } })
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeIdValue} not found`)
      }
    }

    if (autoSet && specializationId) {
      const specialization = await this.prisma.specialization.findUnique({ where: { id: specializationId } })
      if (!specialization) {
        throw new NotFoundException(`Specialization with ID ${specializationId} not found`)
      }
    }

    if (employeeIdValue && employeeIdValue !== currentTask.employeeId) {
      await this.prisma.taskLog.create({
        data: {
          taskId: id,
          employeeId: employeeIdValue,
          hoursWorked: currentTask.currentTime,
          action: ACTION_ENUM.CHANGE_EMPLOYEE,
        },
      })
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        employee: employeeIdValue ? { connect: { id: employeeIdValue } } : { disconnect: true },
        status: 'PENDING',
      },
      include: {
        taskLogs: {
          include: { employee: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  }

  async remove(id: number) {
    const task = await this.prisma.task.findUnique({ where: { id } })
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`)
    }

    // Удаляем все связанные TaskLog записи
    await this.prisma.taskLog.deleteMany({
      where: { taskId: id },
    })

    return this.prisma.task.delete({
      where: { id },
    })
  }
}
