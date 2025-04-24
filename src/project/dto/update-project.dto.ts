import { PartialType } from '@nestjs/mapped-types'
import { CreateProjectDto } from './create-project.dto'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsString()
  companyId: string // Идентификатор компании, к которой принадлежит проект

  @IsString()
  userId: string // Идентификатор пользователя, создавшего проект

  @IsArray()
  @IsString({ each: true })
  employeeIds: string[] // Массив идентификаторов сотрудников, работающих над проектом
}
