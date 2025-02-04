import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../src/companies/entities/company.entity';
import { Employee } from '../src/employees/entities/employee.entity';
import { File } from '../src/files/entities/file.entity';
import { Subscription } from '../src/subscriptions/entities/subscription.entity';

export const testDatabaseConfig = {
  type: 'mysql' as const,
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'Gurgena33!',
  database: 'saas_test',
  entities: [Company, Employee, File, Subscription],
  synchronize: true,
  autoLoadEntities: true,
  dropSchema: true,
};

export const TestTypeOrmModule = TypeOrmModule.forRoot(testDatabaseConfig);
