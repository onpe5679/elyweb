import { BaseEntity } from './common';

export interface ContactSubmission extends BaseEntity {
  name: string;
  email: string;
  message: string;
  status: ContactStatus;
  admin_notes?: string;
}

export type ContactStatus = 'new' | 'read' | 'replied' | 'archived';
