import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import { RequestsRepository } from './requests.repository';

describe('RequestsRepository SQLite integration', () => {
  const testDatabase = join(
    process.cwd(),
    'data',
    'operations-hub.integration-test.db',
  );

  let repository: RequestsRepository;

  beforeEach(() => {
    process.env.OPERATIONS_HUB_DB_PATH = testDatabase;

    removeTestDatabase();

    repository = new RequestsRepository();
  });

  afterEach(() => {
    repository.close();

    delete process.env.OPERATIONS_HUB_DB_PATH;

    removeTestDatabase();
  });

  function removeTestDatabase(): void {
    for (const suffix of ['', '-shm', '-wal']) {
      const file = testDatabase + suffix;

      if (existsSync(file)) {
        rmSync(file, { force: true });
      }
    }
  }

  it('reads the seeded request from SQLite', async () => {
    const request = await repository.findById('REQ-1001');

    expect(request).not.toBeNull();
    expect(request?.requesterId).toBe('employee-001');
    expect(request?.status).toBe('SUBMITTED');
  });

  it('persists a status update in SQLite', async () => {
    const request = await repository.findById('REQ-1001');

    expect(request).not.toBeNull();

    const updated = {
      ...request!,
      status: 'IN_PROGRESS' as const,
      updatedAt: '2026-09-16T12:00:00.000Z',
    };

    await repository.save(updated);

    const persisted = await repository.findById('REQ-1001');

    expect(persisted).not.toBeNull();
    expect(persisted?.status).toBe('IN_PROGRESS');
    expect(persisted?.updatedAt).toBe(
      '2026-09-16T12:00:00.000Z',
    );
  });
});