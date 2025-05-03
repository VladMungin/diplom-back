import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { CreateEmployeeDto } from './create-employee.dto'

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @ApiProperty()
  fullName?: string
  @ApiProperty()
  email?: string
  @ApiProperty()
  phone?: string
}

export class UpdateEmployeeSpecializationDto extends PartialType(CreateEmployeeDto) {
  @ApiProperty()
  specialization?: string
}
