import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { Industry } from '../src/companies/entities/company.entity';
import { testDatabaseConfig } from './test-utils';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

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

  describe('Authentication', () => {
    const testCompany = {
      name: 'Auth Test Company',
      email: 'auth@test.com',
      password: 'Password123!',
      country: 'TestCountry',
      industry: Industry.TECHNOLOGY,
    };

    beforeAll(async () => {
      // Register a test company
      await request(app.getHttpServer())
        .post('/companies/register')
        .send(testCompany);
    });

    it('/auth/login (POST) - should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testCompany.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('/auth/login (POST) - should succeed with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testCompany.email,
          password: testCompany.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
        });
    });

    it('/auth/profile (GET) - should return company profile with valid token', async () => {
      // First login to get token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testCompany.email,
          password: testCompany.password,
        });

      const token = loginResponse.body.access_token;

      // Then get profile
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(testCompany.email);
          expect(res.body).not.toHaveProperty('password');
        });
    });
  });
});
