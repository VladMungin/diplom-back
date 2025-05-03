import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { CreateTypeOfTaskDto } from './create-type_of_task.dto'

export class UpdateTypeOfTaskDto extends PartialType(CreateTypeOfTaskDto) {
  @ApiProperty()
  name?: string
}
