/**
 * contest.service
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
  collection,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { Lead, SyncStatus } from '../leads/lead.model';
import { StorageService } from '../storage/storage-service';
import { UserService } from '../user/user-service';

const LOG_TAG = 'contest.servce';

const CONTEST_DB_CONF = {
  // TTL: 1000 * 60 * 60, // 1 hour
  // TTL: 1000 * 30 * 5, // 5 minutes
  TTL: 1000 * 30, // 30 seconds
  FETCHED_KEY: 'contest_fetched',
}

@Injectable({
  providedIn: 'root',
})
export class ContestService {

  private readonly storageService = inject(StorageService);
  private readonly userService = inject(UserService);
  private readonly firestore = inject(Firestore);
  private user = this.userService.getUser();

  async getContestEntries(userId: any): Promise<Lead[]> { 

    const shouldRefresh = this.storageService.shouldRefresh(CONTEST_DB_CONF.FETCHED_KEY, CONTEST_DB_CONF.TTL);
    console.log('shouldRefresh', shouldRefresh);

    if (!shouldRefresh) {
      console.log('Using cached contest data');
      const cachedContestEntries = await this.storageService.getAll('contestEntries') as Lead[];
      return cachedContestEntries;
    } else {
      const lastRefreshed = this.storageService.getLastFetchedTime(CONTEST_DB_CONF.FETCHED_KEY);
      const collRef = collection(this.firestore, 'leads');
      const q = query(collRef, where("lastModified", ">", lastRefreshed), where("user.id", "==", userId));
      const querySnapshot = await getDocs(q);
      this.storageService.updateFetchedTime(CONTEST_DB_CONF.FETCHED_KEY);
      console.log(LOG_TAG, 'Fetched leads from Firestore, querySnapshot:', querySnapshot.docs.length);
      const leadsToUpdate = querySnapshot.docs.map((doc) => {
        const leadData = doc.data() as Lead;
        leadData.id = doc.id;
        console.log('Lead data:', leadData);
        return leadData;
      });
      await this.storageService.upsert('contestEntries', leadsToUpdate, 'id', true);
      const contestEntries = await this.storageService.getAll('contestEntries') as Lead[];
      return contestEntries;
    }
  }

  
}
