import {
  Controller,
  Post,
  Get,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
  Body,
  Request,
  Patch,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { ShareFileDto } from './dto/share-file.dto';
import { File } from './entities/file.entity';
import { UpdateFileAccessDto } from './dto/update-file-access.dto';

@ApiTags('Files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiOperation({ summary: 'Upload new file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (CSV, XLS, XLSX only)',
        },
        isPublicInCompany: {
          type: 'boolean',
          description: 'Whether file is visible to all company employees',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File successfully uploaded',
    type: File,
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 403, description: 'Storage limit exceeded' })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
    @Request() req,
  ) {
    return this.filesService.uploadFile(
      file,
      req.user.companyId,
      uploadFileDto,
    );
  }

  @ApiOperation({ summary: 'Get all accessible files' })
  @ApiResponse({
    status: 200,
    description: 'List of files accessible to the user',
    type: [File],
  })
  @Get()
  async listFiles(@Request() req) {
    return this.filesService.listFiles(
      req.user.companyId,
      req.user.id,
      req.user.role,
    );
  }

  @ApiOperation({ summary: 'Get file by ID' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File details', type: File })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @Get(':id')
  async getFile(@Param('id') id: string, @Request() req) {
    const canAccess = await this.filesService.canAccessFile(
      id,
      req.user.id,
      req.user.role,
    );

    if (!canAccess) {
      throw new ForbiddenException('You do not have access to this file');
    }

    return this.filesService.getFile(id, req.user.companyId);
  }

  @ApiOperation({ summary: 'Delete file' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File deleted' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @Delete(':id')
  async deleteFile(@Param('id') id: string, @Request() req) {
    return this.filesService.deleteFile(id, req.user.companyId);
  }

  @ApiOperation({ summary: 'Update file access rights' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiBody({ type: UpdateFileAccessDto })
  @ApiResponse({ status: 200, description: 'Access rights updated' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @Patch(':id/access')
  async updateFileAccess(
    @Param('id') id: string,
    @Request() req,
    @Body() updateAccessDto: UpdateFileAccessDto,
  ) {
    return this.filesService.updateFileAccess(
      id,
      req.user.companyId,
      updateAccessDto,
    );
  }

  @Post(':id/share')
  async shareFile(
    @Param('id') id: string,
    @Request() req,
    @Body() shareFileDto: ShareFileDto,
  ) {
    return this.filesService.shareFile(id, req.user.id, shareFileDto);
  }

  @Get(':id/access')
  async getFileAccess(@Param('id') id: string, @Request() req) {
    return this.filesService.getFileAccess(id, req.user.id);
  }

  @Get('shared-with-me')
  async getSharedFiles(@Request() req) {
    return this.filesService.getSharedFiles(req.user.id);
  }
}
