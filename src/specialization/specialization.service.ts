import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateSpecializationDto } from './dto/create-specialization.dto'
import { UpdateSpecializationDto } from './dto/update-specialization.dto'

@Injectable()
export class SpecializationService {
  constructor(private prisma: PrismaService) {}
  async create(createSpecializationDto: CreateSpecializationDto) {
    return await this.prisma.specialization.create({
      data: {
        name: createSpecializationDto.name,
      },
    })
  }

  findAll() {
    return this.prisma.specialization.findMany()
  }

  async findOne(id: string) {
    const specialization = await this.prisma.specialization.findFirst({
      where: { id },
    })

    return {
      name: specialization.name,
      id: specialization.id,
    }
  }

  async update(id: string, updateSpecializationDto: UpdateSpecializationDto) {
    return this.prisma.specialization.update({
      where: { id },
      data: updateSpecializationDto,
    })
  }

  async remove(id: string) {
    return this.prisma.specialization.delete({
      where: {
        id,
      },
    })
  }
}
