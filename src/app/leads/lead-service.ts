import { inject, Injectable } from '@angular/core';
import { Lead } from './lead.model';
import { User } from '../user/user.model';
import { StorageService } from '../storage/storage-service';

const LOG_TAG = 'lead.servce';

@Injectable({
  providedIn: 'root',
})
export class LeadService {

  private readonly storageService = inject(StorageService);

  async getMyLeads() {
    const myCachedLeads = await this.storageService.getAll('leads') as Lead[];
    console.log(LOG_TAG, 'Fetched my leads from storage', myCachedLeads);
    return myCachedLeads;
  }

  async newLead(lead: Lead) {
    console.log(LOG_TAG, 'Creating new lead', lead);

    // Write locally
    const newLead  = await this.storageService.upsert('leads', [lead], 'id');
    console.log(LOG_TAG, 'New lead saved:', newLead);
    return newLead

  }
  
}
