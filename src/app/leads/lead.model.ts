
import { User } from '../user/user.model';

export interface Lead extends User {
  createdDate?: Date;
  notes?: string;
  syncStatus?: 'pending' | 'synced' | 'error';

}