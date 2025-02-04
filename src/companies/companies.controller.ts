import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompaniesService } from './companies.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Company } from './entities/company.entity';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @ApiOperation({ summary: 'Register new company' })
  @ApiResponse({
    status: 201,
    description: 'Company successfully registered',
    type: Company,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid data' })
  @Post('register')
  async register(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get('verify/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.companiesService.verifyEmail(token);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get company profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns company profile',
    type: Company,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    if (req.user.type !== 'company') {
      throw new ForbiddenException(
        'Only company administrators can view profile',
      );
    }
    return this.companiesService.findById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Request() req,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    if (req.user.type !== 'company') {
      throw new ForbiddenException(
        'Only company administrators can update profile',
      );
    }
    return this.companiesService.update(req.user.id, updateCompanyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    if (req.user.type !== 'company') {
      throw new ForbiddenException(
        'Only company administrators can change password',
      );
    }
    return this.companiesService.changePassword(req.user.id, changePasswordDto);
  }
}
