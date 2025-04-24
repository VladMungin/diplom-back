import { PartialType } from '@nestjs/mapped-types'
import { CreateTypeOfTaskDto } from './create-type_of_task.dto'

export class UpdateTypeOfTaskDto extends PartialType(CreateTypeOfTaskDto) {
  name?: string
}
