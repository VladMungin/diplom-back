import { PartialType } from '@nestjs/mapped-types'
import { CreateRoleDto } from './create-role.dto'

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  name?: string
  canEditEmployee?: boolean
  canEditProject?: boolean
  canEditTask?: boolean
  canEditSpecialization?: boolean
  canEditRole?: boolean
}
