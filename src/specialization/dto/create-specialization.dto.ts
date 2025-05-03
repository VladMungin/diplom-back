import { ApiProperty } from '@nestjs/swagger'

export class CreateSpecializationDto {
  @ApiProperty()
  name: string
}

export class SpecializationDto {
  @ApiProperty()
  id: string
  @ApiProperty()
  name: string
}
