import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { CreateTaskDto } from './create-task.dto'

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty()
  title?: string
  @ApiProperty()
  description?: string
  @ApiProperty()
  status?: string
  @ApiProperty()
  createdAt?: Date
  @ApiProperty()
  timeToCompleat?: number
  @ApiProperty()
  currentTime?: number
  @ApiProperty()
  autoSet?: boolean

  // Внешние ключи
  @ApiProperty()
  employeeId: string
  @ApiProperty()
  projectId?: string
  @ApiProperty()
  specializationId: string
  @ApiProperty()
  specialization?: string
  @ApiProperty()
  type?: string
  @ApiProperty()
  typeOfTaskId: string
}
