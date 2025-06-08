import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { verify } from 'argon2'
import { Response } from 'express'
import { UserService } from 'src/user/user.service'
import { AuthDto } from './dto/auth.dto'
import { LoginDTO } from './dto/login.dto.'

@Injectable()
export class AuthService {
  EXPIRE_DAY_REFRESH_TOKEN = 1
  REFRESH_TOKEN_NAME = 'refreshToken'
  constructor(
    private jwt: JwtService,
    private userService: UserService
  ) {}

  async login(dto: LoginDTO) {
    //eslint-disable-next-line
    const { password, ...user } = await this.validateUser(dto)

    const tokens = this.issueToken(user.id)

    return {
      user,
      ...tokens,
    }
  }

  async register(dto: AuthDto) {
    //eslint-disable-next-line
    const oldUser = await this.userService.getByEmail(dto.email)

    if (oldUser) throw new BadRequestException('Пользователь с таким именем уже существует')

    const { ...user } = await this.userService.create(dto)

    const tokens = this.issueToken(user.id)

    return {
      user,
      ...tokens,
    }
  }

  private issueToken(userId: string) {
    const data = { id: userId }

    const accessToken = this.jwt.sign(data, {
      expiresIn: '7d',
    })

    const refreshToken = this.jwt.sign(data, {
      expiresIn: '30d',
    })

    return { accessToken, refreshToken }
  }

  private async validateUser(dto: AuthDto | LoginDTO) {
    const user = await this.userService.getByEmail(dto.email)

    if (!user) throw new NotFoundException('Пользователь не найден')

    const isValid = await verify(user.password, dto.password)

    if (!isValid) throw new UnauthorizedException('Неверный пароль')

    return user
  }

  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    const expiresIn = new Date()
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN)

    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      // domain: 'latest-main.onrender.com',
      expires: expiresIn,
      secure: true,
      sameSite: 'none',
    })
  }

  removeRefreshTokenToResponse(res: Response) {
    res.cookie(this.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      // domain: 'latest-main.onrender.com',
      expires: new Date(0),
      secure: true,
      sameSite: 'none',
    })
  }

  async getNewTokens(refreshToken: string) {
    const result = await this.jwt.verifyAsync(refreshToken)
    if (!result) throw new UnauthorizedException('Invalid refresh token')
    //eslint-disable-next-line
    const { password, ...user } = await this.userService.getById(result.id)

    const tokens = this.issueToken(user.id)

    return {
      user,
      ...tokens,
    }
  }
}
