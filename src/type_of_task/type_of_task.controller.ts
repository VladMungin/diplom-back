import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TypeOfTaskService } from './type_of_task.service';
import { CreateTypeOfTaskDto } from './dto/create-type_of_task.dto';
import { UpdateTypeOfTaskDto } from './dto/update-type_of_task.dto';

@Controller('type-of-task')
export class TypeOfTaskController {
  constructor(private readonly typeOfTaskService: TypeOfTaskService) {}

  @Post()
  create(@Body() createTypeOfTaskDto: CreateTypeOfTaskDto) {
    return this.typeOfTaskService.create(createTypeOfTaskDto);
  }

  @Get()
  findAll() {
    return this.typeOfTaskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typeOfTaskService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTypeOfTaskDto: UpdateTypeOfTaskDto) {
    return this.typeOfTaskService.update(+id, updateTypeOfTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.typeOfTaskService.remove(+id);
  }
}
