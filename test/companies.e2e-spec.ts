import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { Industry } from '../src/companies/entities/company.entity';
import { testDatabaseConfig } from './test-utils';

describe('CompaniesController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(testDatabaseConfig), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Registration and Authentication', () => {
    const testCompany = {
      name: 'Test Company',
      email: 'test@company.com',
      password: 'Password123!',
      country: 'TestCountry',
      industry: Industry.TECHNOLOGY,
    };

    it('/companies/register (POST) - should register a new company', () => {
      return request(app.getHttpServer())
        .post('/companies/register')
        .send(testCompany)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(testCompany.email);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('/auth/login (POST) - should login and return JWT', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testCompany.email,
          password: testCompany.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          jwtToken = res.body.access_token;
        });
    });

    it('/companies/profile (PUT) - should update company profile', () => {
      const updateData = {
        name: 'Updated Company Name',
        country: 'UpdatedCountry',
      };

      return request(app.getHttpServer())
        .put('/companies/profile')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(updateData.name);
          expect(res.body.country).toBe(updateData.country);
        });
    });
  });
});
