import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { UpdateEmployeeDto } from './dto/update-employee.dto'
import { EmployeeService } from './employee.service'

@Controller('emplyee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  create(@Body() createEmplyeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmplyeeDto)
  }

  @Get(':userId')
  findAll(@Param('userId') userId: string) {
    return this.employeeService.findAll(userId)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id)
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
