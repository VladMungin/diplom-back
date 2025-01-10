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
      const leastBusyEmployee = await this.employee.getLeastBusyEmployee()
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

  findAll() {
    return this.prisma.task.findMany()
  }

  findOne(id: number) {
    return this.prisma.task.findUnique({ where: { id } })
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    // const oldTask = this.prisma.task.findUnique({
    //   where: { id: id },
    // })
    // const currentData = {
    //   ...updateTaskDto,
    // }
    const { specialization, type, status, ...rest } = updateTaskDto
    return this.prisma.task.update({
      where: { id },
      data: { ...rest },
    })
  }

  remove(id: number) {
    return this.prisma.task.delete({
      where: { id: id },
    })
  }
}
