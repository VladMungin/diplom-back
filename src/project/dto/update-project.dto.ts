import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { CreateProjectDto } from './create-project.dto'

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
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
  companyId: string // Идентификатор компании, к которой принадлежит проект

  @IsString()
  @ApiProperty()
  userId: string // Идентификатор пользователя, создавшего проект

  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  employeeIds: string[] // Массив идентификаторов сотрудников, работающих над проектом
}
