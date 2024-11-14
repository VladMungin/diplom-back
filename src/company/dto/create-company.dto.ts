import { IsArray, IsOptional, IsString } from 'class-validator'

export class CompanyDto {
  @IsString()
  name: string

  @IsArray()
  @IsOptional()
  userIds: string[]

  @IsArray()
  @IsOptional()
  employeeIds: string[]

  @IsArray()
  @IsOptional()
  projectIds: string[]
}
