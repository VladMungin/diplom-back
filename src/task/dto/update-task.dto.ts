import { PartialType } from '@nestjs/mapped-types'
import { CreateTaskDto } from './create-task.dto'

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  title?: string
  description?: string
  status?: string
  createdAt?: Date
  timeToCompleat?: number
  currentTime?: number
  autoSet?: boolean

  // Внешние ключи
  employeeId: string
  projectId: string
  specializationId: string
  typeOfTaskId: string
}
