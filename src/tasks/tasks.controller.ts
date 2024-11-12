import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { CreateTasksDto } from './tasks.dto'
import { TasksService } from './tasks.service'

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('')
  findAll() {
    return this.tasksService.findAll()
  }

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() dto: CreateTasksDto) {
    return this.tasksService.create(dto)
  }
}
