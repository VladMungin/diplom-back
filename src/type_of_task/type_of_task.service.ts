import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateTypeOfTaskDto } from './dto/create-type_of_task.dto'
import { UpdateTypeOfTaskDto } from './dto/update-type_of_task.dto'

@Injectable()
export class TypeOfTaskService {
  constructor(private prisma: PrismaService) {}
  create(createTypeOfTaskDto: CreateTypeOfTaskDto) {
    return this.prisma.typeOfTask.create({
      data: createTypeOfTaskDto,
    })
  }

  findAll() {
    return this.prisma.typeOfTask.findMany()
  }

  findOne(id: string) {
    return this.prisma.typeOfTask.findUnique({ where: { id } })
  }

  update(id: string, updateTypeOfTaskDto: UpdateTypeOfTaskDto) {
    return this.prisma.typeOfTask.update({
      where: { id },
      data: updateTypeOfTaskDto,
    })
  }

  remove(id: string) {
    return this.prisma.typeOfTask.delete({
      where: { id },
    })
  }
}
