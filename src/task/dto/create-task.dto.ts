import { ApiProperty } from '@nestjs/swagger'

export class CreateTaskDto {
  @ApiProperty()
  title: string
  @ApiProperty()
  description: string
  @ApiProperty()
  specialization: string
  @ApiProperty()
  type: string
  @ApiProperty()
  comment: string
  @ApiProperty()
  createdAt: Date
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
  typeOfTaskId: string
  @ApiProperty()
  specializationId: string
}
