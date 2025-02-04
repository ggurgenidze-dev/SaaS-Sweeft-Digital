import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import * as fs from 'fs';
import { CompaniesService } from '../companies/companies.service';
import * as fsPromises from 'fs/promises';
import { ALLOWED_FILE_TYPES } from './file.constants';
import { UploadFileDto } from './dto/upload-file.dto';
import { EmployeesService } from '../employees/employees.service';
import { ShareFileDto } from './dto/share-file.dto';
import { Employee } from '../employees/entities/employee.entity';
import { SubscriptionUsageService } from '../subscriptions/subscription-usage.service';
import { UpdateFileAccessDto } from './dto/update-file-access.dto';

const UPLOAD_DIR = 'uploads';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @InjectRepository(File)
    private readonly filesRepository: Repository<File>,
    private readonly subscriptionUsageService: SubscriptionUsageService,
    private subscriptionsService: SubscriptionsService,
    private companiesService: CompaniesService,
    private employeesService: EmployeesService,
  ) {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    companyId: string,
    uploadFileDto: UploadFileDto,
  ): Promise<File> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Validate file type
    if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${Object.keys(ALLOWED_FILE_TYPES).join(', ')}`,
      );
    }

    // Get file extension from mime type
    const extension = ALLOWED_FILE_TYPES[file.mimetype];
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

    // Create final path with extension
    const finalPath = `uploads/${uniqueFilename}`;

    // Move file to final location with extension
    await fs.promises.rename(file.path, finalPath);

    // Check subscription limits
    await this.subscriptionUsageService.checkStorageLimit(companyId, file.size);
    await this.subscriptionUsageService.checkFileLimit(companyId);

    // Save file metadata
    const newFile = new File();
    newFile.filename = file.originalname;
    newFile.path = finalPath;
    newFile.mimeType = file.mimetype;
    newFile.size = file.size;
    newFile.companyId = companyId;
    newFile.isPublicInCompany = uploadFileDto.isPublicInCompany || false;

    const savedFile = await this.filesRepository.save(newFile);

    // Update usage
    await this.subscriptionUsageService.incrementUsage(companyId, file.size);

    return savedFile;
  }

  async findAllByCompany(companyId: string): Promise<File[]> {
    return this.filesRepository.find({
      where: { company: { id: companyId } },
      relations: ['allowedEmployees'],
    });
  }

  async findAccessibleByEmployee(employeeId: string): Promise<File[]> {
    return this.filesRepository
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.allowedEmployees', 'employee')
      .where('file.isPublicInCompany = :isPublic', { isPublic: true })
      .orWhere('employee.id = :employeeId', { employeeId })
      .getMany();
  }

  async updatePermissions(
    fileId: string,
    companyId: string,
    options: { isPublicInCompany?: boolean; allowedEmployeeIds?: string[] },
  ): Promise<File> {
    const file = await this.filesRepository.findOne({
      where: { id: fileId, company: { id: companyId } },
      relations: ['allowedEmployees'],
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (options.isPublicInCompany !== undefined) {
      file.isPublicInCompany = options.isPublicInCompany;
    }

    if (options.allowedEmployeeIds) {
      file.allowedEmployees = options.allowedEmployeeIds.map(
        (id) => ({ id }) as any,
      );
    }

    return this.filesRepository.save(file);
  }

  async deleteFile(fileId: string, companyId: string): Promise<void> {
    const file = await this.filesRepository.findOne({
      where: { id: fileId, companyId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    try {
      // Delete physical file
      await fsPromises.unlink(file.path);

      // Delete database record
      await this.filesRepository.remove(file);
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw new BadRequestException('Could not delete file');
    }
  }

  async checkFileAccess(
    fileId: string,
    userId: string,
    userType: 'company' | 'employee',
  ): Promise<boolean> {
    const file = await this.filesRepository.findOne({
      where: { id: fileId },
      relations: ['company', 'allowedEmployees'],
    });

    if (!file) {
      return false;
    }

    if (userType === 'company') {
      return file.company.id === userId;
    }

    return (
      file.isPublicInCompany ||
      file.allowedEmployees.some((emp) => emp.id === userId)
    );
  }

  async listFiles(
    companyId: string,
    userId: string,
    userRole: string,
  ): Promise<File[]> {
    const queryBuilder = this.filesRepository
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.company', 'company')
      .leftJoinAndSelect('file.allowedEmployees', 'employee')
      .where('file.companyId = :companyId', { companyId });

    // ADMIN can see all files
    if (userRole === 'ADMIN') {
      return queryBuilder.getMany();
    }

    // MANAGER can see public files and files shared with their team
    if (userRole === 'MANAGER') {
      return queryBuilder
        .andWhere(
          '(file.isPublicInCompany = :isPublic OR employee.id = :userId)',
          { isPublic: true, userId },
        )
        .getMany();
    }

    // EMPLOYEE can only see public files and files explicitly shared with them
    return queryBuilder
      .andWhere(
        '(file.isPublicInCompany = :isPublic OR employee.id = :userId)',
        { isPublic: true, userId },
      )
      .getMany();
  }

  async getFile(id: string, companyId: string): Promise<File> {
    const file = await this.filesRepository.findOne({
      where: { id, companyId },
      relations: ['company', 'allowedEmployees'],
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async updateFileAccess(
    fileId: string,
    companyId: string,
    updateAccessDto: UpdateFileAccessDto,
  ): Promise<File> {
    const file = await this.filesRepository.findOne({
      where: { id: fileId, companyId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return this.filesRepository.save({
      ...file,
      ...updateAccessDto,
    });
  }

  async shareFile(
    fileId: string,
    companyId: string,
    shareFileDto: ShareFileDto,
  ): Promise<File> {
    const file = await this.filesRepository.findOne({
      where: { id: fileId, company: { id: companyId } },
      relations: ['company', 'allowedEmployees'],
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (shareFileDto.isPublicInCompany !== undefined) {
      file.isPublicInCompany = shareFileDto.isPublicInCompany;
    }

    if (shareFileDto.employeeIds?.length) {
      const employees = await this.employeesService.findByIds(
        shareFileDto.employeeIds,
        companyId,
      );

      if (employees.length !== shareFileDto.employeeIds.length) {
        throw new BadRequestException('Some employees were not found');
      }

      file.allowedEmployees = employees;
    }

    return this.filesRepository.save(file);
  }

  async getFileAccess(
    fileId: string,
    companyId: string,
  ): Promise<{
    isPublicInCompany: boolean;
    allowedEmployees: Employee[];
  }> {
    const file = await this.filesRepository.findOne({
      where: { id: fileId, company: { id: companyId } },
      relations: ['allowedEmployees'],
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return {
      isPublicInCompany: file.isPublicInCompany,
      allowedEmployees: file.allowedEmployees,
    };
  }

  async getSharedFiles(employeeId: string): Promise<File[]> {
    return this.filesRepository
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.company', 'company')
      .leftJoinAndSelect('file.allowedEmployees', 'employee')
      .where('file.isPublicInCompany = :isPublic', { isPublic: true })
      .orWhere('employee.id = :employeeId', { employeeId })
      .getMany();
  }

  async canAccessFile(
    fileId: string,
    userId: string,
    userRole: string,
  ): Promise<boolean> {
    const file = await this.filesRepository.findOne({
      where: { id: fileId },
      relations: ['allowedEmployees'],
    });

    if (!file) {
      return false;
    }

    // ADMIN can access all files
    if (userRole === 'ADMIN') {
      return true;
    }

    // MANAGER and EMPLOYEE can access public files or files shared with them
    return (
      file.isPublicInCompany ||
      file.allowedEmployees.some((emp) => emp.id === userId)
    );
  }
}
