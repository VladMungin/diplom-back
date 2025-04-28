import { Injectable } from '@nestjs/common'
import * as schedule from 'node-schedule'

@Injectable()
export class ScheduleService {
  scheduleJob(name: string, rule: string, callback: () => Promise<void>) {
    schedule.scheduleJob(name, rule, async () => {
      await callback()
    })
  }
}
