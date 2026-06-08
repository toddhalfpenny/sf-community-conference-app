
import { User } from '../user/user.model';

export interface Lead {
  id: string;
  createdDate?: Date | {seconds: number, nanoseconds: number};
  createdById?: number | string;
  user?: User;
  lastModified?: Date | {seconds: number, nanoseconds: number};
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