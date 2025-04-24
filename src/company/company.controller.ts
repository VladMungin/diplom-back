import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { CompanyService } from './company.service'
import { CompanyDto } from './dto/create-company.dto'

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}
  @Get('')
  findAll() {
    return this.companyService.findAll()
  }
  @Post()
  create(@Body() createCompanyDto: CompanyDto) {
    return this.companyService.create(createCompanyDto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: CompanyDto) {
    return this.companyService.update(id, updateCompanyDto)
  }
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.companyService.delete(id)
  }
}
