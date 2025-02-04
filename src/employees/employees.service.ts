import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ActivateEmployeeDto } from './dto/activate-employee.dto';
import { EmailService } from '../shared/services/email.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    private emailService: EmailService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async create(
    createEmployeeDto: CreateEmployeeDto,
    companyId: string,
  ): Promise<Employee> {
    const employee = new Employee();
    employee.email = createEmployeeDto.email;
    employee.name = createEmployeeDto.name;
    employee.role = createEmployeeDto.role;
    employee.companyId = companyId;
    employee.activationToken = crypto.randomBytes(32).toString('hex');

    return this.employeesRepository.save(employee);
  }

  async activate(
    token: string,
    activateEmployeeDto: ActivateEmployeeDto,
  ): Promise<void> {
    const employee = await this.employeesRepository.findOne({
      where: { activationToken: token },
    });

    if (!employee) {
      throw new BadRequestException('Invalid activation token');
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(activateEmployeeDto.password, 10);

    employee.password = hashedPassword;
    employee.isActive = true;
    employee.activationToken = null;
    await this.employeesRepository.save(employee);
  }

  async findAllByCompany(companyId: string): Promise<Employee[]> {
    return this.employeesRepository.find({
      where: { company: { id: companyId } },
    });
  }

  async remove(companyId: string, employeeId: string): Promise<void> {
    const result = await this.employeesRepository
      .createQueryBuilder('employee')
      .delete()
      .from(Employee)
      .where('id = :employeeId AND company.id = :companyId', {
        employeeId,
        companyId,
      })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException('Employee not found');
    }

    // Update subscription user count
    const remainingEmployeeCount = await this.employeesRepository.count({
      where: { company: { id: companyId } },
    });
    await this.subscriptionsService.updateUserCount(
      companyId,
      remainingEmployeeCount,
    );
  }

  async findByEmail(email: string): Promise<Employee> {
    return this.employeesRepository.findOne({ where: { email } });
  }

  async findByIds(ids: string[], companyId: string): Promise<Employee[]> {
    return this.employeesRepository.findBy({
      id: In(ids),
      company: { id: companyId },
    });
  }

  async findAll(companyId: string): Promise<Employee[]> {
    return this.employeesRepository.find({
      where: { companyId },
      select: ['id', 'email', 'name', 'role', 'isActive', 'createdAt'],
    });
  }

  async getCount(companyId: string): Promise<number> {
    return this.employeesRepository.count({
      where: { companyId },
    });
  }

  async findOne(id: string, companyId: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { id, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }
}
