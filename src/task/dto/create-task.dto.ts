import { ApiProperty } from '@nestjs/swagger'

export class CreateTaskDto {
  @ApiProperty()
  title: string

  @ApiProperty()
  description: string

  @ApiProperty()
  specializationId: string

  @ApiProperty()
  typeOfTaskId: string

  @ApiProperty()
  timeToCompleat: number

  @ApiProperty()
  currentTime: number

  @ApiProperty()
  status: string

  @ApiProperty()
  autoSet: boolean

  @ApiProperty()
  projectId: string

  @ApiProperty()
  employeeId: string

  @ApiProperty()
  createdById: string
}
