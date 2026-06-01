import { inject, Injectable } from '@angular/core';
import {
  collection,
  getDocs,
  Firestore,
  doc,
  getDoc,
  query,
  where,
  updateDoc,
  increment,
  setDoc,
} from '@angular/fire/firestore';
import { StorageService } from '../storage/storage-service';
import { UserService } from '../user/user.service';
import { Poll, PollVotes } from './poll.model';

const LOG_TAG = 'poll.servce';

const Poll_DB_CONF = {
  TTL: 1000 * 60, // 1 minutes
  // TTL: 1000 * 10, // 10 secods
  FETCHED_KEY: 'polls_fetched',
}
@Injectable({
  providedIn: 'root',
})
export class PollService {
  private readonly firestore = inject(Firestore);
  private readonly storageService = inject(StorageService);
  private readonly userService = inject(UserService);

  protected polls: Poll[] = [];
  
  async getPolls(allStatus: boolean = false): Promise<Poll[]> {
    console.log('Fetching polls from Firestore...');

    const shouldRefresh = allStatus || this.storageService.shouldRefresh(Poll_DB_CONF.FETCHED_KEY, Poll_DB_CONF.TTL);
    console.log('shouldRefresh', shouldRefresh);

    if (!shouldRefresh) {
      return this.polls;
    } else {
      const collRef = collection(this.firestore, 'polls'); 
      const q = allStatus ? 
        query(collRef) :
        query(collRef, where("isActive", "==", true))
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

  public async getResults(pollId: string) {
    try {
      const docRef = doc(this.firestore, "pollVotes", pollId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const pollVotes = docSnap.data() as PollVotes;
        console.log(LOG_TAG, 'Fetched pollVotes from Firestore', pollVotes);
        return pollVotes;
      } else {
        console.warn(LOG_TAG, 'No such pollVotes in Firestore:', pollId);
        return null;
      }
    } catch (error) {
      console.error(LOG_TAG, 'Error fetching pollVotes from Firestore:', error);
      throw error;
    }
  }

  public async upsertPolls(polls: Poll[]): Promise<any[]> { 
    let errors: any[] = [];
    for (const poll of polls) {
      console.log('Upserting poll', poll);
      setDoc(doc(this.firestore, "polls", poll.id), poll, {merge: true}).then(async (res) => {
        console.log('Poll saved to Firestore', res);
      }).catch(async (error) => {
        console.error('Error saving poll to Firestore:', error);
        errors.push({poll, error});
      });
    }
    return errors;
  }

  public async vote(pollId: string, optionId: string) {
    console.log(LOG_TAG, `Voting on poll ${pollId} for option ${optionId}`);

    // Increment vote count against the poll
    try { 
      const sessionDoc = doc(this.firestore, "pollVotes", pollId);
      await updateDoc(sessionDoc, {
        [optionId]: increment(1) 
      });

      // Update eventusers record
      this.userService.voted(pollId, optionId);
      return;
    } catch (error) {
      console.error(LOG_TAG, 'Error updating poll votes:', error);
      return;
    }
  }

}
