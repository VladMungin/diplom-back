import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateProjectDto {
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
