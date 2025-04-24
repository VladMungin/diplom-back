import { IsEmail, IsString, MinLength } from 'class-validator'

export class AuthDto {
  @IsEmail()
  email: string
  @MinLength(2, {
    message: 'Имя должно быть не меньше 2 символов',
  })
  @IsString()
  name: string

  @MinLength(6, {
    message: 'Пароль должен быть длиннее 6 символов',
  })
  @IsString()
  password: string
  @IsString()
  companyName: string
}
