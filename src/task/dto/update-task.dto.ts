export class UpdateTaskStatusDto {
  status: string
}

// update-task-time.dto.ts
export class UpdateTaskTimeDto {
  currentTime: number
}

// update-task-employee.dto.ts
export class UpdateTaskEmployeeDto {
  employeeId?: string | null
  autoSet?: boolean
  specializationId?: string
}
// update-task.dto.ts
import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator'

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsUUID()
  @IsOptional()
  projectId?: string | null

  @IsUUID()
  @IsOptional()
  employeeId?: string | null

  @IsUUID()
  @IsOptional()
  specializationId?: string

  @IsUUID()
  @IsOptional()
  typeOfTaskId?: string

  @IsOptional()
  autoSet?: boolean

  @IsUUID()
  @IsOptional()
  createdById?: string

  @IsInt()
  @IsOptional()
  currentTime?: number

  @IsInt()
  @IsOptional()
  timeToCompleat?: number

  @IsString()
  @IsOptional()
  status?: string
}
