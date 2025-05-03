import { ApiProperty } from '@nestjs/swagger'

export class CreateRoleDto {
  @ApiProperty()
  name: string
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
  @ApiProperty()
  userId: string
}
