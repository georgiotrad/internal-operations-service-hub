import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ServiceRequest } from './request.types';

@Injectable()
export class RequestsRepository {
  private readonly dataFile = join(
    __dirname,
    '..',
    '..',
    'data',
    'requests.json',
  );

  async findById(id: string): Promise<ServiceRequest | null> {
    const items = await this.readAll();

    return items.find((item) => item.id === id) ?? null;
  }

  async save(updated: ServiceRequest): Promise<ServiceRequest> {
    const items = await this.readAll();

    const index = items.findIndex((item) => item.id === updated.id);

    if (index < 0) {
      throw new InternalServerErrorException(
        'Request disappeared before it could be saved.',
      );
    }

    items[index] = updated;

    try {
      await fs.writeFile(
        this.dataFile,
        JSON.stringify(items, null, 2) + '\n',
        'utf8',
      );

      return updated;
    } catch (error) {
      console.error('Failed to save request:', error);

      throw new InternalServerErrorException(
        'The request could not be persisted.',
      );
    }
  }

  private async readAll(): Promise<ServiceRequest[]> {
    try {
      console.log('Reading request data from:', this.dataFile);

      const raw = await fs.readFile(this.dataFile, 'utf8');

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        throw new Error('requests.json must contain an array.');
      }

      return parsed as ServiceRequest[];
    } catch (error) {
      console.error('Failed to read request store:', error);
      console.error('Expected file:', this.dataFile);

      throw new InternalServerErrorException(
        'The request store is unavailable.',
      );
    }
  }
}