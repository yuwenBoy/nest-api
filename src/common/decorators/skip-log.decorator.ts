// src/common/decorators/skip-log.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const SKIP_LOG_METADATA = 'SKIP_LOG';

export const SkipLog = () => SetMetadata(SKIP_LOG_METADATA, true);
