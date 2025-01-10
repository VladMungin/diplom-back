export class CreateTaskDto {
  title: string
  description: string
  specialization: string
  type: string
  comment: string
  createdAt: Date
  timeToCompleat: number
  currentTime: number
  status: string
  autoSet: boolean
  projectId: string
  employeeId: string
  typeOfTaskId: string
  specializationId: string
}
