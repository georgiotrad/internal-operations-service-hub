import {
  Injectable,
  InternalServerErrorException,
  OnModuleDestroy,
} from '@nestjs/common';
import Database = require('better-sqlite3');
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { ServiceRequest } from './request.types';

@Injectable()
export class RequestsRepository implements OnModuleDestroy {
  private readonly databaseFile =
    process.env.OPERATIONS_HUB_DB_PATH ??
    join(
      __dirname,
      '..',
      '..',
      'data',
      'operations-hub.db',
    );

  private readonly db: Database.Database;

  constructor() {
    try {
      const dataDirectory = dirname(this.databaseFile);

      if (!existsSync(dataDirectory)) {
        mkdirSync(dataDirectory, { recursive: true });
      }

      this.db = new Database(this.databaseFile);
      this.db.pragma('journal_mode = WAL');

      this.createSchema();
      this.seedDatabase();

      console.log('SQLite request store:', this.databaseFile);
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);

      throw new InternalServerErrorException(
        'The request store is unavailable.',
      );
    }
  }

  async findById(id: string): Promise<ServiceRequest | null> {
    try {
      const row = this.db
        .prepare(
          `
          SELECT
            id,
            requester_id AS requesterId,
            department,
            category,
            description,
            status,
            updated_at AS updatedAt
          FROM service_requests
          WHERE id = ?
          `,
        )
        .get(id) as ServiceRequest | undefined;

      return row ?? null;
    } catch (error) {
      console.error('Failed to read request from SQLite:', error);

      throw new InternalServerErrorException(
        'The request store is unavailable.',
      );
    }
  }

  async save(updated: ServiceRequest): Promise<ServiceRequest> {
    try {
      const result = this.db
        .prepare(
          `
          UPDATE service_requests
          SET
            requester_id = ?,
            department = ?,
            category = ?,
            description = ?,
            status = ?,
            updated_at = ?
          WHERE id = ?
          `,
        )
        .run(
          updated.requesterId,
          updated.department,
          updated.category,
          updated.description,
          updated.status,
          updated.updatedAt,
          updated.id,
        );

      if (result.changes === 0) {
        throw new InternalServerErrorException(
          'Request disappeared before it could be saved.',
        );
      }

      return updated;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      console.error('Failed to save request to SQLite:', error);

      throw new InternalServerErrorException(
        'The request could not be persisted.',
      );
    }
  }

  close(): void {
    if (this.db.open) {
      this.db.close();
    }
  }

  onModuleDestroy(): void {
    this.close();
  }

  private createSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS service_requests (
        id TEXT PRIMARY KEY,
        requester_id TEXT NOT NULL,
        department TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }

  private seedDatabase(): void {
    const existing = this.db
      .prepare(
        `
        SELECT id
        FROM service_requests
        WHERE id = ?
        `,
      )
      .get('REQ-1001');

    if (existing) {
      return;
    }

    this.db
      .prepare(
        `
        INSERT INTO service_requests (
          id,
          requester_id,
          department,
          category,
          description,
          status,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
      )
      .run(
        'REQ-1001',
        'employee-001',
        'IT',
        'Laptop Support',
        'Laptop cannot connect to the office Wi-Fi.',
        'SUBMITTED',
        '2026-09-09T08:00:00.000Z',
      );
  }
}