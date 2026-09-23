import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { RequestIntakeProvider } from './request-intake.provider';
import {
  AiIntakeCandidate,
  ALLOWED_CATEGORIES,
  ALLOWED_DEPARTMENTS,
  IntakeDepartment,
  RequestIntakeInput,
  ValidatedIntakeCandidate,
} from './request-intake.types';

@Injectable()
export class RequestIntakeService {
  constructor(
    private readonly provider: RequestIntakeProvider,
  ) {}

  async assist(
    input: RequestIntakeInput,
  ): Promise<ValidatedIntakeCandidate> {
    const text = input.text?.trim();

    if (!text) {
      throw new BadRequestException(
        'Request text is required.',
      );
    }

    let candidate: AiIntakeCandidate;

    try {
      candidate = await this.provider.generate(text);
    } catch (error) {
      throw new ServiceUnavailableException(
        'AI-assisted intake is temporarily unavailable.',
      );
    }

    return this.validateCandidate(candidate);
  }

  private validateCandidate(
    candidate: AiIntakeCandidate,
  ): ValidatedIntakeCandidate {
    if (
      !ALLOWED_DEPARTMENTS.includes(
        candidate.department as IntakeDepartment,
      )
    ) {
      throw new BadRequestException(
        'AI returned an unsupported department.',
      );
    }

    const department =
      candidate.department as IntakeDepartment;

    const allowedCategories =
      ALLOWED_CATEGORIES[department] as readonly string[];

    if (!allowedCategories.includes(candidate.category)) {
      throw new BadRequestException(
        'AI returned an unsupported category.',
      );
    }

    if (!candidate.description?.trim()) {
      throw new BadRequestException(
        'AI returned an empty description.',
      );
    }

    if (
      candidate.needsClarification &&
      !candidate.clarificationQuestion?.trim()
    ) {
      throw new BadRequestException(
        'AI requested clarification without a question.',
      );
    }

    return {
      department,
      category:
        candidate.category as ValidatedIntakeCandidate['category'],
      description: candidate.description.trim(),
      needsClarification: candidate.needsClarification,
      clarificationQuestion:
        candidate.clarificationQuestion?.trim() ?? null,
    };
  }
}