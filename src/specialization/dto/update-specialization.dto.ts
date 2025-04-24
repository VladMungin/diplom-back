import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { CreateSpecializationDto } from './create-specialization.dto'

export class UpdateSpecializationDto extends PartialType(CreateSpecializationDto) {
  @ApiProperty()
  name: string
}
