// update-task-log.dto.ts
import { IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdateTaskLogDto {
  @IsOptional()
  @IsNumber()
  taskId?: number

  @IsOptional()
  @IsString()
  employeeId?: string

  @IsOptional()
  @IsNumber()
  hoursWorked?: number
}
