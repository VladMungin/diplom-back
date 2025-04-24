import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class AuthDto {
  @ApiProperty()
  @IsEmail()
  email: string
  @MinLength(2, {
    message: 'Имя должно быть не меньше 2 символов',
  })
  @ApiProperty()
  @IsString()
  name: string

  @MinLength(6, {
    message: 'Пароль должен быть длиннее 6 символов',
  })
  @ApiProperty()
  @IsString()
  password: string
  @ApiProperty()
  @IsString()
  companyName: string
}
