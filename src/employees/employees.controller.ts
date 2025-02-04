import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { EmployeeRole } from './employee.types';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ActivateEmployeeDto } from './dto/activate-employee.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Employee } from './entities/employee.entity';

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @ApiOperation({ summary: 'Create new employee' })
  @ApiBody({ type: CreateEmployeeDto })
  @ApiResponse({ status: 201, description: 'Employee created', type: Employee })
  @ApiResponse({ status: 403, description: 'Employee limit exceeded' })
  @Roles(EmployeeRole.ADMIN)
  @Post()
  async createEmployee(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Request() req,
  ) {
    return this.employeesService.create(createEmployeeDto, req.user.companyId);
  }

  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({
    status: 200,
    description: 'List of company employees',
    type: [Employee],
  })
  @Roles(EmployeeRole.ADMIN, EmployeeRole.MANAGER)
  @Get()
  async findAll(@Request() req) {
    return this.employeesService.findAll(req.user.companyId);
  }

  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Employee details', type: Employee })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.employeesService.findOne(id, req.user.companyId);
  }

  @ApiOperation({ summary: 'Delete employee' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Employee deleted' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @Roles(EmployeeRole.ADMIN)
  @Delete(':id')
  async removeEmployee(@Param('id') id: string, @Request() req) {
    return this.employeesService.remove(id, req.user.companyId);
  }

  @Post('activate/:token')
  async activate(
    @Param('token') token: string,
    @Body() activateEmployeeDto: ActivateEmployeeDto,
  ) {
    return this.employeesService.activate(token, activateEmployeeDto);
  }

  @Get('dev/token/:email')
  async getActivationToken(@Param('email') email: string) {
    const employee = await this.employeesService.findByEmail(email);
    return { activationToken: employee?.activationToken };
  }
}
