import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    private mailerService: MailerService,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    // Check if company with email already exists
    const existingCompany = await this.findByEmail(createCompanyDto.email);
    if (existingCompany) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createCompanyDto.password, 10);

    // Generate activation token
    const activationToken = crypto.randomBytes(32).toString('hex');

    // Create company
    const company = this.companiesRepository.create({
      ...createCompanyDto,
      password: hashedPassword,
      activationToken,
    });

    await this.companiesRepository.save(company);

    // Send activation email
    await this.sendActivationEmail(company.email, activationToken);

    return company;
  }

  async activate(token: string): Promise<void> {
    const company = await this.companiesRepository.findOne({
      where: { activationToken: token },
    });

    if (!company) {
      throw new NotFoundException('Invalid activation token');
    }

    company.isActive = true;
    company.activationToken = null;
    await this.companiesRepository.save(company);
  }

  async findByEmail(email: string): Promise<Company> {
    return this.companiesRepository.findOne({ where: { email } });
  }

  async updateProfile(
    id: string,
    updateData: Partial<Company>,
  ): Promise<Company> {
    const company = await this.companiesRepository.findOne({ where: { id } });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Don't allow updating sensitive fields
    delete updateData.password;
    delete updateData.activationToken;
    delete updateData.isActive;

    Object.assign(company, updateData);
    return this.companiesRepository.save(company);
  }

  async updatePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const company = await this.companiesRepository.findOne({ where: { id } });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      company.password,
    );
    if (!isPasswordValid) {
      throw new ConflictException('Current password is incorrect');
    }

    company.password = await bcrypt.hash(newPassword, 10);
    await this.companiesRepository.save(company);
  }

  private async sendActivationEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const activationUrl = `${process.env.FRONTEND_URL}/activate?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Activate Your Company Account',
      template: 'activation',
      context: {
        url: activationUrl,
      },
    });
  }
}
