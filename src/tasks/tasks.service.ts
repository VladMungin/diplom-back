import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateTasksDto } from './tasks.dto'

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.task.findMany()
    // return
    // [
    //   {
    //     id: 1,
    //     title: 'Task 1',
    //     description: 'Description for Task 1',
    //     completed: false,
    //   },
    //   {
    //     id: 2,
    //     title: 'Task 2',
    //     description: 'Description for Task 2',
    //     completed: false,
    //   },
    //   {
    //     id: 3,
    //     title: 'Task 3',
    //     description: 'Description for Task 3',
    //     completed: false,
    //   },
    // ]
  }
  create(dto: CreateTasksDto) {
    return this.prisma.task.create({ data: dto })
  }
}
