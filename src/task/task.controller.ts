import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskEmployeeDto, UpdateTaskStatusDto, UpdateTaskTimeDto } from './dto/update-task.dto'
import { TaskService } from './task.service'

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto)
  }

  @Get('/user/:userId')
  findAll(@Param('userId') userId: string) {
    return this.taskService.findAll(userId)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(+id)
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateTaskStatusDto: UpdateTaskStatusDto) {
    return this.taskService.updateStatus(+id, updateTaskStatusDto)
  }

  @Patch(':id/time')
  updateTime(@Param('id') id: string, @Body() updateTaskTimeDto: UpdateTaskTimeDto) {
    return this.taskService.updateTime(+id, updateTaskTimeDto)
  }

  @Patch(':id/employee')
  updateEmployee(@Param('id') id: string, @Body() updateTaskEmployeeDto: UpdateTaskEmployeeDto) {
    return this.taskService.updateEmployee(+id, updateTaskEmployeeDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskService.remove(+id)
  }
}
