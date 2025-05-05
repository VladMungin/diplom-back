import { ApiProperty } from '@nestjs/swagger'

export class CreateSpecializationDto {
  @ApiProperty()
  name: string
  @ApiProperty()
  userId?: string
}

export class SpecializationDto {
  @ApiProperty()
  id: string
  @ApiProperty()
  name: string
}
