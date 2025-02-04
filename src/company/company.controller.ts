import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Param,
  Patch,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { Company } from './entities/company.entity';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companiesService: CompanyService) {}

  @Post('register')
  async register(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get('activate/:token')
  async activate(@Param('token') token: string) {
    await this.companiesService.activate(token);
    return { message: 'Company activated successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateData: Partial<Company>) {
    return this.companiesService.updateProfile(req.user.id, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async updatePassword(
    @Request() req,
    @Body() passwordData: { currentPassword: string; newPassword: string },
  ) {
    await this.companiesService.updatePassword(
      req.user.id,
      passwordData.currentPassword,
      passwordData.newPassword,
    );
    return { message: 'Password updated successfully' };
  }
}
