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

    return this.prisma.task.create({
      data: {
        ...task,
        createdById,
        projectId,
        employeeId: employeeIdValue,
        specializationId,
        typeOfTaskId,
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
        createdBy: true,
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
      },
    })
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const { createdById, employeeId, projectId, specializationId, typeOfTaskId, autoSet, ...taskData } = updateTaskDto

    let employeeIdValue: string | null = null
    if (autoSet && specializationId) {
      const leastBusyEmployee = await this.employee.getLeastBusyEmployee(specializationId)
      employeeIdValue = leastBusyEmployee?.id ?? null
    } else if (employeeId) {
      employeeIdValue = employeeId
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        ...taskData,
        ...(createdById && { createdById }),
        ...(projectId && { projectId }),
        ...(employeeIdValue && { employeeId: employeeIdValue }),
        ...(specializationId && { specializationId }),
        ...(typeOfTaskId && { typeOfTaskId }),
      },
    })
  }

  remove(id: number) {
    return this.prisma.task.delete({
      where: { id: id },
    })
  }
}
