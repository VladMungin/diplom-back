import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { UpdateEmployeeDto } from './dto/update-employee.dto'
import { EmployeeService } from './employee.service'

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto)
  }

  @Get('/user/:userId')
  findAll(@Param('userId') userId: string, @Query('specializationId') specializationId?: string) {
    return this.employeeService.findAll(userId, specializationId)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id)
  }

  @Get('/least-busy-employee/:specializationId')
  getLeastBusyEmployee(@Param('specializationId') id: string) {
    return this.employeeService.getLeastBusyEmployee(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeeService.update(id, updateEmployeeDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeService.remove(id)
  }
}
