import { Employee, User } from '@prisma/client'
import { IsArray, IsString } from 'class-validator'

export class CompanyDto {
  @IsString()
  name: string

  @IsArray()
  users: User[]

  @IsArray()
  employee: Employee[]
}
