import { IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdateTimeLogDto {
  @IsOptional()
  @IsNumber() // Changed to IsNumber to match Int
  taskId?: number

  @IsOptional()
  @IsString()
  employeeId?: string

  @IsOptional()
  @IsNumber()
  hoursWorked?: number

  @IsOptional()
  @IsString()
  description?: string
}
