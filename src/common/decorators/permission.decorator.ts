import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';
export const Permission = (subject: string, action: string) =>
  SetMetadata(PERMISSION_KEY, { subject, action });
