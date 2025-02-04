/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { EmailService } from '../shared/services/email.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { SubscriptionType } from '../subscriptions/subscription.types';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private emailService: EmailService,
    @Inject(forwardRef(() => SubscriptionsService))
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const existingCompany = await this.findByEmail(createCompanyDto.email);
    if (existingCompany) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(createCompanyDto.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const company = this.companyRepository.create({
      ...createCompanyDto,
      password: hashedPassword,
      verificationToken,
    });

    await this.companyRepository.save(company);

    await this.subscriptionsService.create(company.id, SubscriptionType.FREE);

    await this.emailService.sendVerificationEmail(
      company.email,
      verificationToken,
    );

    const { password, ...result } = company;
    return result as Company;
  }

  async verifyEmail(token: string): Promise<void> {
    const company = await this.companyRepository.findOne({
      where: { verificationToken: token },
    });

    if (!company) {
      throw new BadRequestException('Invalid verification token');
    }

    company.isEmailVerified = true;
    company.verificationToken = null;
    await this.companyRepository.save(company);
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    Object.assign(company, updateCompanyDto);
    await this.companyRepository.save(company);

    const { password, ...result } = company;
    return result as Company;
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      company.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    company.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.companyRepository.save(company);
  }

  async findByEmail(email: string): Promise<Company> {
    return this.companyRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<Company> {
    return this.companyRepository.findOne({ where: { id } });
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
