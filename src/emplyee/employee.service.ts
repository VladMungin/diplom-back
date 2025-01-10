import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { UserService } from 'src/user/user.service'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { UpdateEmployeeDto } from './dto/update-employee.dto'
import { Specialization } from '@prisma/client'

@Injectable()
export class EmployeeService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService
  ) {}
  async create(createEmployeeDto: CreateEmployeeDto) {
    const { fullName, companyId, email, password, phone, userId } = createEmployeeDto
    const role = await this.role.create({
      name: 'Employee',
    })

    const user = {
      name: fullName,
      email,
      password,
      roleId: role.id,
      companyId,
    }

    let currentSpecialization: Specialization | null

    const specialization = await this.specialization.findOne(createEmployeeDto.specialization)

    if (!specialization) {
      currentSpecialization = await this.specialization.create({
        name: createEmployeeDto.specialization,
      })
    } else {
      currentSpecialization = specialization
    }

    const employee = await this.prisma.employee.create({
      data: {
        fullName,
        phone,
        email,
        company: {
          connect: {
            id: companyId,
          },
        },
        role: {
          connect: {
            id: role.id,
          },
        },
        specialization: {
          connect: {
            id: currentSpecialization.id,
          },
        },
        user: {
          connect: { id: userId },
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

  async getLeastBusyEmployee() {
    const employeesWithTaskTimes = await this.prisma.employee.findMany({
      include: {
        tasks: {
          select: {
            currentTime: true,
          },
        },
      },
    })

    const employeesWithTotalTimes = employeesWithTaskTimes.map(employee => {
      const totalCurrentTime = employee.tasks.reduce((total, task) => total + task.currentTime, 0)
      return {
        id: employee.id,
        name: employee.name,
        totalCurrentTime,
      }
    })

    // Находим сотрудника с наименьшей загруженностью
    const leastBusyEmployee = employeesWithTotalTimes.reduce((prev, current) => {
      return prev.totalCurrentTime < current.totalCurrentTime ? prev : current
    })

    return leastBusyEmployee
  }
}
