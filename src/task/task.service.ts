import { Injectable } from '@nestjs/common'
import { PrismaService } from './../prisma.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}
  create(createTaskDto: CreateTaskDto) {
    const { projectId, employeeId, ...task } = createTaskDto

    return this.prisma.task.create({
      data: {
        // ...task,
        title: 'Task 1',
        description: 'Task description',
        type: 'Task type',
        comment: 'Task comment',
        timeToCompleat: 30000,
        currentTime: 40000,

        status: 'created',
        project: {
          connect: { id: '' },
        },
        employee: {
          connect: { id: '' },
        },
      },
    })
  }

  findAll() {
    return this.prisma.task.findMany()
  }

  findOne(id: number) {
    return this.prisma.task.findUnique({ where: { id: id } })
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    // const oldTask = this.prisma.task.findUnique({
    //   where: { id: id },
    // })
    const currentData = {
      ...updateTaskDto,
    }
    return this.prisma.task.update({
      where: { id: id },
      data: currentData,
    })
  }

  remove(id: number) {
    return this.prisma.task.delete({
      where: { id: id },
    })
  }
}
