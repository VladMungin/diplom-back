import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CompanyDto } from './dto/create-company.dto'

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}
  create(createCompanyDto: CompanyDto) {
    return this.prisma.company.create({ data: createCompanyDto })
  }

  findAll() {
    return this.prisma.company.findMany()
  }

  update(id: string, updateCompanyDto: CompanyDto) {
    const company = this.prisma.company.findFirst({
      where: { id },
    })

    if (!company) {
      throw new Error('Company not found')
    }
    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    })
  }

  delete(id: string) {
    const company = this.prisma.company.findFirst({
      where: { id },
    })

    if (!company) {
      throw new Error('Company not found')
    }
    return this.prisma.company.delete({ where: { id } })
  }
}
