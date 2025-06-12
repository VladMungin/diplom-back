import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { CreateTaskLogDto } from './dto/create-task-log.dto'
import { UpdateTaskLogDto } from './dto/update-task-log.dto'
import { TaskLogService } from './task-log.service'

@Controller('task-log')
export class TaskLogController {
  constructor(private readonly taskLogService: TaskLogService) {}

  @Post()
  create(@Body() createTaskLogDto: CreateTaskLogDto) {
    return this.taskLogService.create(createTaskLogDto)
  }

  @Post('tasks/:taskId/assign')
  assignEmployee(@Param('taskId') taskId: string, @Body('employeeId') employeeId: string) {
    return this.taskLogService.assignEmployee(parseInt(taskId), employeeId)
  }

  @Get()
  findAll() {
    return this.taskLogService.findAll()
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.taskLogService.findOne(id)
  // }

  @Get(':id')
  findOneByTaskId(@Param('id') id: string) {
    return this.taskLogService.findOneByTaskId(+id)
  }

  @Get('tasks/:taskId/employees')
  getEmployeeIds(@Param('taskId') taskId: string) {
    return this.taskLogService.getEmployeeIdsForTask(parseInt(taskId))
  }

  @Get('employee/:employeeId')
  getTaskLogByEmployee(@Param('employeeId') employeeId: string, @Query('month') month: string) {
    return this.taskLogService.getTaskLogByEmployee(employeeId, parseInt(month))
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskLogDto: UpdateTaskLogDto, action: string) {
    return this.taskLogService.update(id, updateTaskLogDto, action)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskLogService.remove(id)
  }
}
