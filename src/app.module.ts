import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { EmployeesModule } from './employees/employees.module';
import { FilesModule } from './files/files.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { SharedModule } from './shared/shared.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    CompaniesModule,
    EmployeesModule,
    FilesModule,
    SubscriptionsModule,
    SharedModule,
  ],
})
export class AppModule {}
