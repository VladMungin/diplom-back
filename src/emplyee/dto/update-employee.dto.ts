import { PartialType } from '@nestjs/mapped-types'
import { CreateEmployeeDto } from './create-employee.dto'

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  name?: string
  email?: string
  password?: string
  projectIds?: string[]
  taskIds?: number[]
}