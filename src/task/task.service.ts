import { Injectable } from '@nestjs/common'
import { EmployeeService } from 'src/emplyee/employee.service'
import { PrismaService } from './../prisma.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly employee: EmployeeService
  ) {}
  async create(createTaskDto: CreateTaskDto) {
    const { projectId, employeeId, specializationId, typeOfTaskId, autoSet, ...task } = createTaskDto
    let currentEmployeeId: string | null = null
    if (autoSet) {
      const leastBusyEmployee = await this.employee.getLeastBusyEmployee(specializationId)
      currentEmployeeId = leastBusyEmployee?.id || null
    } else {
      currentEmployeeId = employeeId
    }

    return this.prisma.task.create({
      data: {
        ...task,
        project: {
          connect: { id: projectId },
        },
        employee: {
          connect: { id: currentEmployeeId },
        },
        specialization: {
          connect: { id: specializationId },
        },
        type: {
          connect: {
            id: typeOfTaskId,
          },
        },
      },
    })
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
      },
    })
  }

  findOne(id: number) {
    return this.prisma.task.findUnique({
      where: { id },
      include: { employee: true, project: true, type: true, specialization: true },
    })
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const { employeeId, projectId, specializationId, typeOfTaskId, autoSet, ...taskData } = updateTaskDto

    let currentEmployeeId: string | null = null
    if (autoSet && specializationId) {
      const leastBusyEmployee = await this.employee.getLeastBusyEmployee(specializationId)
      currentEmployeeId = leastBusyEmployee?.id || null
    } else if (employeeId) {
      currentEmployeeId = employeeId
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        ...taskData,
        ...(projectId && {
          project: {
            connect: { id: projectId },
          },
        }),
        ...(currentEmployeeId && {
          employee: {
            connect: { id: currentEmployeeId },
          },
        }),
        ...(specializationId && {
          specialization: {
            connect: { id: specializationId },
          },
        }),
        ...(typeOfTaskId && {
          type: {
            connect: { id: typeOfTaskId },
          },
        }),
      },
    })
  }

  remove(id: number) {
    return this.prisma.task.delete({
      where: { id: id },
    })
  }
}
