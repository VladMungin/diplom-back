import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class LoginDTO {
  @ApiProperty()
  @IsEmail()
  email: string
  @MinLength(6, {
    message: 'Пароль должен быть длиннее 6 символов',
  })
  @ApiProperty()
  @IsString()
  password: string
}
