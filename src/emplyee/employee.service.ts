import { Injectable, NotFoundException } from '@nestjs/common'
import { hash } from 'argon2'
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

    const role = await this.prisma.role.findFirst({
      where: {
        id: createEmployeeDto.roleId,
      },
    })

    let currentRole: SpecializationDto | null

    if (!role) {
      currentRole = await this.role.create({
        name: 'Employee',
      })
    } else {
      currentRole = role
    }

    const user = {
      name: fullName,
      email,
      password: await hash(password),
      roleId: currentRole.id,
      companyId,
    }

    const specialization = await this.prisma.specialization.findFirst({
      where: {
        id: createEmployeeDto.specializationId,
      },
    })

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
            id: currentRole.id,
          },
        },
        specialization: {
          connect: {
            id: specialization.id,
          },
        },
        user: {
          connect: { id: userId },
        },
      },
    })

    await this.prisma.user.create({
      data: {
        ...user,
        id: employee.id,
      },
    })

    return employee
  }

  async findAll(userId: string, specializationId?: string) {
    return await this.prisma.employee.findMany({
      where: {
        userId,
        ...(specializationId && { specializationId }),
      },
      include: {
        specialization: true,
        role: true,
      },
    })
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        company: true,
        projects: true,
        role: true,
        tasks: true,
        user: true,
        specialization: true,
      },
    })

    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`)
    }

    return employee
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
        id: employee.id,
      },
    })

    return this.prisma.employee.delete({
      where: {
        id,
      },
    })
  }

  async getLeastBusyEmployee(specializationId: string) {
    // Validate specializationId (optional, depending on requirements)
    if (!specializationId) {
      throw new Error('Specialization ID is required')
    }

    // Fetch employees with tasks, selecting only necessary fields
    const employeesWithTaskTimes = await this.prisma.employee.findMany({
      where: {
        specializationId,
      },
      include: {
        tasks: {
          select: {
            currentTime: true,
          },
        },
      },
      // Optional: Add take to limit results for performance
    })

    // Handle case where no employees are found
    if (employeesWithTaskTimes.length === 0) {
      throw new Error('No employees found with the specified specialization')
    }

    // Calculate total time for each employee
    const employeesWithTotalTime = employeesWithTaskTimes.map(employee => {
      const totalTime = employee.tasks.reduce((sum, task) => {
        // Ensure currentTime is a number, default to 0 if null/undefined
        const time = typeof task.currentTime === 'number' ? task.currentTime : 0
        return sum + time
      }, 0)
      return {
        ...employee,
        totalTime,
      }
    })

    // If only one employee, return it directly
    if (employeesWithTotalTime.length === 1) {
      return employeesWithTotalTime[0]
    }

    // Find employee with minimum total time
    const leastBusyEmployee = employeesWithTotalTime.reduce((prev, current) => {
      // Handle tie-breaking (e.g., by employee ID or other criteria)
      if (prev.totalTime === current.totalTime) {
        // Example: Choose employee with lower ID as tiebreaker
        return prev.id < current.id ? prev : current
      }
      return prev.totalTime < current.totalTime ? prev : current
    })

    // Optionally, strip totalTime from the result to match Employee type
    const { ...employeeData } = leastBusyEmployee
    return employeeData
  }
}
