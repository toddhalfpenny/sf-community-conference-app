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
  getDoc,
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

  async getLead(leadId: string, forceRefresh: boolean = false) {
    if (!forceRefresh) {
      const cachedLead = (await this.storageService.get('leads', leadId))[0] as Lead;
      if (cachedLead) {
        console.log(LOG_TAG, 'Fetched lead from storage', cachedLead);
        return cachedLead;
      } else {
        return null;
      }
    }

    // If not in cache or forceRefresh is true, fetch from Firestore
    try {
      const docRef = doc(this.firestore, "leads", leadId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const lead = docSnap.data() as Lead;
        console.log(LOG_TAG, 'Fetched lead from Firestore', lead);
        // Cache the lead locally
        await this.storageService.upsert('leads', [lead], 'id');
        return lead;
      } else {
        console.warn(LOG_TAG, 'No such lead in Firestore:', leadId);
        return null;
      }
    } catch (error) {
      console.error(LOG_TAG, 'Error fetching lead from Firestore:', error);
      throw error;
    }
  
  }

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
      lead.sponsorId = this.user?.sponsorAdmin ?? this.user?.boothStaff;
      lead.createdDate = new Date();
      lead.modifiedDate = new Date();
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
      }).catch(async (error) => {
        console.error(LOG_TAG, 'Error saving lead to Firestore:', error);
        lead.syncError = error.message;
        await this.storageService.upsert('leads', [lead], 'id');
        return lead;
      });
    } catch (error) {
      console.error(LOG_TAG, 'Error saving lead:', error);
      throw error;
    }

  }

  public async saveLead(lead: Lead) {
    console.log(LOG_TAG, 'Saving lead', lead);
    lead.modifiedDate = new Date();
    await this.storageService.upsert('leads', [lead], 'id');
    await this.syncOutstanding();
    return;
  }

  public async syncOutstanding() {
    const allLeads = await this.storageService.getAll('leads') as Lead[];
    const outstandingLeads = allLeads.filter(lead => lead.status !== SyncStatus.synced);
    console.log(LOG_TAG, 'Outstanding leads to sync', outstandingLeads);
    for (const lead of outstandingLeads) {
      try {
        await setDoc(doc(this.firestore, "leads", lead.id), lead);
        lead.status = SyncStatus.synced;
        await this.storageService.upsert('leads', [lead], 'id');
        console.log(LOG_TAG, 'Lead synced to Firestore', lead);
      } catch (error) {
        console.error(LOG_TAG, 'Error syncing lead to Firestore:', error);
        // lead.syncError = error.message as string;
        await this.storageService.upsert('leads', [lead], 'id');
      }
    }
  }
  
}
