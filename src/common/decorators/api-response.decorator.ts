import { SetMetadata } from '@nestjs/common';

export const API_RESPONSE_METADATA = 'api_response_metadata';

export interface ApiResponseOptions {
  message?: string;
  statusCode?: number;
}

export const ApiResponseMessage = (options: ApiResponseOptions) =>
  SetMetadata(API_RESPONSE_METADATA, options);
