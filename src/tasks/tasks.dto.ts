import { IsBoolean, IsString } from 'class-validator'

export class CreateTasksDto {
  @IsString()
  title: string
 
  @IsBoolean()
  compleated: boolean
}

// export type TasksUpdateDto = Partial<CreateTasksDto>
