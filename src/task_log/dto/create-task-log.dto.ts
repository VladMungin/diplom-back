// create-task-log.dto.ts
import { IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateTaskLogDto {
  @IsNumber()
  taskId: number

  @IsString()
  employeeId: string

  @IsOptional()
  @IsNumber()
  hoursWorked?: number
}
