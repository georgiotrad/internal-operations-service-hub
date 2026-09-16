import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import request = require('supertest');
import { AppModule } from '../app.module';
import { RequestsRepository } from './requests.repository';

describe('Service Request flow E2E', () => {
  const testDatabase = join(
    process.cwd(),
    'data',
    'operations-hub.e2e-test.db',
  );

  let app: INestApplication;
  let repository: RequestsRepository;

  function removeTestDatabase(): void {
    for (const suffix of ['', '-shm', '-wal']) {
      const file = testDatabase + suffix;

      if (existsSync(file)) {
        rmSync(file, { force: true });
      }
    }
  }

  beforeEach(async () => {
    process.env.OPERATIONS_HUB_DB_PATH = testDatabase;

    removeTestDatabase();

    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    repository = app.get(RequestsRepository);
  });

  afterEach(async () => {
    await app.close();

    delete process.env.OPERATIONS_HUB_DB_PATH;

    removeTestDatabase();
  });

  it('allows IT staff to start work and persists the change', async () => {
    const initialResponse = await request(app.getHttpServer())
      .get('/api/requests/REQ-1001')
      .set('x-user-id', 'it-staff-001')
      .set('x-role', 'IT_STAFF')
      .expect(200);

    expect(initialResponse.body.status).toBe('SUBMITTED');

    const updateResponse = await request(app.getHttpServer())
      .patch('/api/requests/REQ-1001/status')
      .set('x-user-id', 'it-staff-001')
      .set('x-role', 'IT_STAFF')
      .send({
        status: 'IN_PROGRESS',
      })
      .expect(200);

    expect(updateResponse.body.status).toBe('IN_PROGRESS');

    const persistedResponse = await request(app.getHttpServer())
      .get('/api/requests/REQ-1001')
      .set('x-user-id', 'it-staff-001')
      .set('x-role', 'IT_STAFF')
      .expect(200);

    expect(persistedResponse.body.status).toBe('IN_PROGRESS');
  });

  it('denies an employee from performing the staff status update', async () => {
    await request(app.getHttpServer())
      .patch('/api/requests/REQ-1001/status')
      .set('x-user-id', 'employee-001')
      .set('x-role', 'EMPLOYEE')
      .send({
        status: 'IN_PROGRESS',
      })
      .expect(403);

    const unchangedResponse = await request(app.getHttpServer())
      .get('/api/requests/REQ-1001')
      .set('x-user-id', 'employee-001')
      .set('x-role', 'EMPLOYEE')
      .expect(200);

    expect(unchangedResponse.body.status).toBe('SUBMITTED');
  });

  it('rejects an invalid lifecycle transition', async () => {
    await request(app.getHttpServer())
      .patch('/api/requests/REQ-1001/status')
      .set('x-user-id', 'it-staff-001')
      .set('x-role', 'IT_STAFF')
      .send({
        status: 'COMPLETED',
      })
      .expect(400);

    const unchangedResponse = await request(app.getHttpServer())
      .get('/api/requests/REQ-1001')
      .set('x-user-id', 'it-staff-001')
      .set('x-role', 'IT_STAFF')
      .expect(200);

    expect(unchangedResponse.body.status).toBe('SUBMITTED');
  });

  it('handles a database failure cleanly', async () => {
    repository.close();

    const response = await request(app.getHttpServer())
      .get('/api/requests/REQ-1001')
      .set('x-user-id', 'it-staff-001')
      .set('x-role', 'IT_STAFF')
      .expect(500);

    expect(response.body.message).toBe(
      'The request store is unavailable.',
    );
  });
});