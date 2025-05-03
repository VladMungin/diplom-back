import { ApiProperty } from '@nestjs/swagger'

export class CreateTypeOfTaskDto {
  @ApiProperty()
  name: string
}
