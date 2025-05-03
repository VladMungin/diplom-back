import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { CreateRoleDto } from './create-role.dto'

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiProperty()
  name?: string
  @ApiProperty()
  canEditEmployee?: boolean
  @ApiProperty()
  canEditProject?: boolean
  @ApiProperty()
  canEditTask?: boolean
  @ApiProperty()
  canEditSpecialization?: boolean
  @ApiProperty()
  canEditRole?: boolean
}
