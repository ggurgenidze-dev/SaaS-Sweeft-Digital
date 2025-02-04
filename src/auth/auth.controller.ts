import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  UnauthorizedException,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CompaniesService } from '../companies/companies.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly companiesService: CompaniesService,
  ) {}

  @ApiOperation({ summary: 'Company Login' })
  @ApiResponse({
    status: 200,
    description: 'Returns JWT token for company authentication',
    schema: {
      properties: {
        access_token: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    // First check if company exists
    const company = await this.companiesService.findByEmail(loginDto.email);
    if (!company) {
      throw new UnauthorizedException('Company not found');
    }

    const user = await this.authService.validateCompany(
      loginDto.email,
      loginDto.password,
    );

    if (user) {
      return this.authService.login(user, 'company');
    }

    // Try employee login if company login fails
    const employee = await this.authService.validateEmployee(
      loginDto.email,
      loginDto.password,
    );
    if (employee) {
      return this.authService.login(employee, 'employee');
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  // Add this temporary endpoint to debug
  @Get('dev/check-company/:email')
  async checkCompany(@Param('email') email: string) {
    const company = await this.companiesService.findByEmail(email);
    if (!company) {
      return { exists: false };
    }
    return {
      exists: true,
      id: company.id,
      email: company.email,
      hasPassword: !!company.password,
    };
  }
}
