/**
 * lead.service
 * 
 * TODO
 * - OFFLINE WRITING TO FIRESTORE WILL NOT RESULT IN THE ASYNC RETURNING - so need to handle this
 */
import { inject, Injectable } from '@angular/core';
import {
  setDoc,
  doc,
  Firestore,
} from '@angular/fire/firestore';
import { Lead, SyncStatus } from './lead.model';
import { StorageService } from '../storage/storage-service';
import { UserService } from '../user/user-service';

const LOG_TAG = 'lead.servce';

@Injectable({
  providedIn: 'root',
})
export class LeadService {

  private readonly storageService = inject(StorageService);
  private readonly userService = inject(UserService);
  private readonly firestore = inject(Firestore);
  private user = this.userService.getUser();

  async getMyLeads() {
    const myCachedLeads = await this.storageService.getAll('leads') as Lead[];
    console.log(LOG_TAG, 'Fetched my leads from storage', myCachedLeads);
    return myCachedLeads;
  }

  async newLead(lead: Lead) {
    console.log(LOG_TAG, 'Creating new lead', lead);
    try {
      lead.id = `${this.user?.id}-${lead.user?.id}`;
      lead.createdById = this.user?.id,
      lead.sponsorId = this.user?.sponsorAdmin ?? this.user?.boothStaff
      lead.createdDate = new Date();
      lead.status = SyncStatus.pending;
      // Write locally
      await this.storageService.upsert('leads', [lead], 'id');
      console.log(LOG_TAG, 'New lead saved:', lead);


      setTimeout(() => {
        console.warn(LOG_TAG, 'Firestore timeout');
        return lead;
      }, 5000);
      
      // Try to write to server
      setDoc(doc(this.firestore, "leads", lead.id), lead).then(async (res) => {
        console.log(LOG_TAG, 'Lead saved to Firestore', res);
        lead.status = SyncStatus.synced;
        await this.storageService.upsert('leads', [lead], 'id');
        setTimeout(() => {
          return lead;
        }, 1000);
      }).catch((error) => {
        console.error(LOG_TAG, 'Error saving lead to Firestore:', error);
        return lead;
      });
    } catch (error) {
      console.error(LOG_TAG, 'Error saving lead:', error);
      throw error;
    }

  }
  
}
