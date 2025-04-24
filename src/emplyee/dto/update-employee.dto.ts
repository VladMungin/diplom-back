import { PartialType } from '@nestjs/mapped-types'
import { CreateEmployeeDto } from './create-employee.dto'

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  fullName?: string
  email?: string
  phone?: string
}

export class UpdateEmployeeSpecializationDto extends PartialType(CreateEmployeeDto) {
  specialization?: string
}
