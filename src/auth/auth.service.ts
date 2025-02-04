/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CompaniesService } from '../companies/companies.service';
import { EmployeesService } from '../employees/employees.service';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private companiesService: CompaniesService,
    private employeesService: EmployeesService,
  ) {}

  async validateCompany(email: string, password: string) {
    const company = await this.companiesService.findByEmail(email);
    if (
      company &&
      (await this.companiesService.validatePassword(password, company.password))
    ) {
      return company;
    }
    return null;
  }

  async validateEmployee(email: string, token: string) {
    const employee = await this.employeesService.findByEmail(email);
    if (employee && employee.activationToken === token) {
      return employee;
    }
    return null;
  }

  async login(user: any, type: 'company' | 'employee') {
    if (type === 'company') {
      return this.loginCompany(user);
    } else {
      return this.loginEmployee(user);
    }
  }

  private async loginCompany(company: any) {
    const payload: JwtPayload = {
      id: company.id,
      email: company.email,
      type: 'company',
      role: 'ADMIN',
      companyId: company.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private async loginEmployee(employee: any) {
    const payload: JwtPayload = {
      id: employee.id,
      email: employee.email,
      type: 'employee',
      role: employee.role,
      companyId: employee.companyId,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
