import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}
  async create(createRoleDto: CreateRoleDto) {
    return this.prisma.role.create({
      data: createRoleDto,
    })
  }

  findAll(userId: string) {
    console.log(userId)
    return this.prisma.role.findMany({
      where: {
        userId: userId,
      },
    })
  }

  findOne(id: string) {
    return this.prisma.role.findFirst({
      where: { id },
    })
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    return this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    })
  }

  async remove(id: string) {
    return this.prisma.role.delete({
      where: {
        id,
      },
    })
  }
}
