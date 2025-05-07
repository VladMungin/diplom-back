import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { CreateTypeOfTaskDto } from './dto/create-type_of_task.dto'
import { UpdateTypeOfTaskDto } from './dto/update-type_of_task.dto'
import { TypeOfTaskService } from './type_of_task.service'

@Controller('type-of-task')
export class TypeOfTaskController {
  constructor(private readonly typeOfTaskService: TypeOfTaskService) {}

  @Post()
  create(@Body() createTypeOfTaskDto: CreateTypeOfTaskDto) {
    return this.typeOfTaskService.create(createTypeOfTaskDto)
  }

  @Get(':userId')
  findAll(@Param('userId') userId: string) {
    return this.typeOfTaskService.findAll(userId)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typeOfTaskService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTypeOfTaskDto: UpdateTypeOfTaskDto) {
    return this.typeOfTaskService.update(id, updateTypeOfTaskDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.typeOfTaskService.remove(id)
  }
}
