import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { UserService } from 'src/user/user.service'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { UpdateEmployeeDto } from './dto/update-employee.dto'

@Injectable()
export class EmployeeService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService
  ) {}
  async create(createEmployeeDto: CreateEmployeeDto) {
    const { name, companyId, email, password } = createEmployeeDto
    const user = {
      name,
      email,
      password,
      role: 'employee',
    }

    const employee = await this.prisma.employee.create({
      data: {
        name,
        email,
        company: {
          connect: {
            id: companyId,
          },
        },
      },
    })

    await this.prisma.user.create({
      data: user,
    })

    return employee
  }

  async findAll(userId: string) {
    return await this.prisma.user
      .findUnique({
        where: {
          id: userId,
        },
      })
      .employees()
  }

  findOne(id: string) {
    return this.prisma.employee.findUnique({
      where: {
        id,
      },
    })
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const { email, name, password, projectIds, taskIds } = updateEmployeeDto
    const updateUser = email || name || password

    const oldEmployee = await this.prisma.employee.findUnique({
      where: {
        id,
      },
    })

    if (updateUser) {
      const newUser = {
        email,
        name,
        password,
      }

      await this.userService.update(id, newUser)
    }

    return await this.prisma.employee.update({
      where: {
        id,
      },
      data: {
        ...oldEmployee,
        ...updateEmployeeDto,
        projects: {
          connect: projectIds.map(id => ({ id })),
        },
        tasks: {
          connect: taskIds.map(id => ({ id })),
        },
      },
    })
  }

  remove(id: string) {
    return this.prisma.employee.delete({
      where: {
        id,
      },
    })
  }
}
