
import { User } from '../user/user.model';

export interface Lead {
  id: string;
  createdDate?: Date;
  createdById?: number;
  user?: User;
  modifiedDate?: Date;
  notes?: string;
  sponsorId?: string;
  status?: SyncStatus;
  syncError?: string;
}

export enum SyncStatus {
  'pending' = 0,
  'synced' = 1,
  'deleted' = 2,
}