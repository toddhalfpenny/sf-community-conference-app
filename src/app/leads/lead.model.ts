
import { User } from '../user/user.model';

export interface Lead {
  id: string;
  createdDate?: Date;
  createdById?: number;
  user?: User;
  notes?: string;
  sponsorId?: string;
  status?: SyncStatus;
}

export enum SyncStatus {
  'pending' = 0,
  'synced' = 1,
  'deleted' = 2,
}