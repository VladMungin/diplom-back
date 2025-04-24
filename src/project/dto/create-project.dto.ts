import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string

  @IsOptional()
  @IsString()
  @ApiProperty()
  description?: string

  @IsString()
  @ApiProperty()
  userId: string // Идентификатор пользователя, создавшего проект

  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  employeeIds: string[] // Массив идентификаторов сотрудников, работающих над проектом
}
