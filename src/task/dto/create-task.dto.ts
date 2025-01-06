import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  description: string

  @IsString()
  @IsNotEmpty()
  type: string

  @IsString()
  @IsNotEmpty()
  projectId: string

  @IsString()
  @IsNotEmpty()
  employeeId: string

  @IsString()
  @IsNotEmpty()
  comment: string

  @IsDate()
  @IsNotEmpty()
  createdAt: Date

  @IsNumber()
  @IsNotEmpty()
  timeToCompleat: number

  @IsNumber()
  @IsNotEmpty()
  currentTime: number

  @IsString()
  @IsNotEmpty()
  status: string

  @IsBoolean()
  autoSet: boolean
}
