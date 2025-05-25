import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { CreateTimeLogDto } from './dto/create-time-log.dto'
import { UpdateTimeLogDto } from './dto/update-time-log.dto'
import { TimeLogService } from './time-log.service'

@Controller('time-logs')
export class TimeLogController {
  constructor(private readonly timeLogService: TimeLogService) {}

  @Post()
  create(@Body() createTimeLogDto: CreateTimeLogDto) {
    return this.timeLogService.create(createTimeLogDto)
  }

  @Get()
  findAll() {
    return this.timeLogService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.timeLogService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTimeLogDto: UpdateTimeLogDto) {
    return this.timeLogService.update(id, updateTimeLogDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.timeLogService.remove(id)
  }
}
