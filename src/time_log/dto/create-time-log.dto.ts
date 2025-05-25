import { IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateTimeLogDto {
  @IsNumber()
  taskId: number

  @IsString()
  employeeId: string

  @IsNumber()
  hoursWorked: number

  @IsOptional()
  @IsString()
  description?: string
}
