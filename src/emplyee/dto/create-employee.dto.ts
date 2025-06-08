import { ApiProperty } from '@nestjs/swagger'

export class CreateEmployeeDto {
  @ApiProperty()
  fullName: string
  @ApiProperty()
  email: string
  @ApiProperty()
  phone: string
  @ApiProperty()
  password: string
  @ApiProperty()
  projectId: string
  @ApiProperty()
  companyId: string
  @ApiProperty()
  specializationId: string
  @ApiProperty()
  userId: string
  @ApiProperty()
  roleId: string
}
