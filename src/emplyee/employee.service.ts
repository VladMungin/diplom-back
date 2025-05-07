import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { RoleService } from 'src/role/role.service'
import { SpecializationDto } from 'src/specialization/dto/create-specialization.dto'
import { SpecializationService } from 'src/specialization/specialization.service'
import { UserService } from 'src/user/user.service'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { UpdateEmployeeDto } from './dto/update-employee.dto'

@Injectable()
export class EmployeeService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private role: RoleService,
    private specialization: SpecializationService
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

    let currentSpecialization: SpecializationDto | null

    const specialization = await this.specialization.findOne(createEmployeeDto.specialization)

    if (!specialization) {
      currentSpecialization = await this.specialization.create({
        name: createEmployeeDto.specialization,
        userId: userId,
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
      .createdEmployee()
  }

  findOne(id: string) {
    return this.prisma.employee.findUnique({
      where: {
        id,
      },
    })
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const { email, fullName, phone } = updateEmployeeDto

    const oldEmployee = await this.prisma.employee.findUnique({
      where: {
        id,
      },
    })

    const oldUser = await this.prisma.user.findFirst({
      where: {
        email: oldEmployee.email,
      },
    })

    await this.prisma.user.update({
      where: {
        id: oldUser.id,
      },
      data: {
        email: email || oldUser.email,
        name: fullName || oldUser.name,
      },
    })

    return await this.prisma.employee.update({
      where: {
        id,
      },
      data: {
        fullName: fullName || oldEmployee.fullName,
        phone: phone || oldEmployee.phone,
        email: email || oldEmployee.email,
      },
    })
  }

  async remove(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: {
        id,
      },
    })

    this.prisma.user.delete({
      where: {
        email: employee.email,
      },
    })

    return this.prisma.employee.delete({
      where: {
        id,
      },
    })
  }

  async getLeastBusyEmployee(specializationId: string) {
    // Находим всех сотрудников с указанной специализацией и хотя бы одной задачей
    const employeesWithTaskTimes = await this.prisma.employee.findMany({
      where: {
        specializationId: specializationId,
        tasks: {
          some: {}, // Убеждаемся, что у сотрудника есть хотя бы одна задача
        },
      },
      include: {
        tasks: {
          select: {
            currentTime: true,
          },
        },
      },
    })

    // Если нет подходящих сотрудников, возвращаем null или выбрасываем ошибку
    if (employeesWithTaskTimes.length === 0) {
      return null
      // или throw new Error('No employees with the specified specialization and tasks found');
    }

    // Рассчитываем общее время задач для каждого сотрудника
    const employeesWithTotalTime = employeesWithTaskTimes.map(employee => {
      const totalTime = employee.tasks.reduce((sum, task) => sum + task.currentTime, 0)
      return {
        ...employee,
        totalTime,
      }
    })

    // Находим сотрудника с минимальным общим временем задач
    const leastBusyEmployee = employeesWithTotalTime.reduce((prev, current) =>
      prev.totalTime < current.totalTime ? prev : current
    )

    return leastBusyEmployee
  }
}
