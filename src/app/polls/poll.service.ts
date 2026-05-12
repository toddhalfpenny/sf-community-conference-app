import { inject, Injectable } from '@angular/core';
import {
  collection,
  getDocs,
  Firestore,
  doc,
  getDoc,
  query,
  where,
} from '@angular/fire/firestore';
import { StorageService } from '../storage/storage-service';
import { Poll } from './poll.model';

const LOG_TAG = 'poll.servce';

const Poll_DB_CONF = {
  TTL: 1000 * 60, // 1 minutes
  FETCHED_KEY: 'polls_fetched',
}
@Injectable({
  providedIn: 'root',
})
export class PollService {
  private readonly firestore = inject(Firestore);
  private readonly storageService = inject(StorageService);

  protected polls: Poll[] = [];
  
  async getPolls(): Promise<Poll[]> {
    console.log('Fetching polls from Firestore...');

    const shouldRefresh = this.storageService.shouldRefresh(Poll_DB_CONF.FETCHED_KEY, Poll_DB_CONF.TTL);
    console.log('shouldRefresh', shouldRefresh);

    if (!shouldRefresh) {
      return this.polls;
    } else {
      const collRef = collection(this.firestore, 'polls'); 
      const q = query(collRef, where("isActive", "==", true));
      const querySnapshot = await getDocs(q);
      this.storageService.updateFetchedTime(Poll_DB_CONF.FETCHED_KEY);
      console.log(LOG_TAG, 'Fetched sponsors from Firestore, querySnapshot:', querySnapshot.docs.length);
      const polls = querySnapshot.docs.map((doc) => {
        const pollData = doc.data() as Poll;
        pollData.id = doc.id;
        return pollData;
      });
      this.polls = polls;
      return this.polls;
    }
  }

}
