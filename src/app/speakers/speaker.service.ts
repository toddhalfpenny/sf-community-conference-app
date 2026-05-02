import { inject, Injectable } from '@angular/core';
import {
  collection,
  getDocs,
  Firestore,
  doc,
  getDoc,
  setDoc
} from '@angular/fire/firestore';
import { Speaker } from './speaker.model';
import { StorageService } from '../storage/storage-service';

const LOG_TAG = 'speaker.servce';

const SPEAKERS_DB_CONF = {
  TTL: 1000 * 60 * 60, // 1 hour
  // TTL: 1000 * 30, // 30 seconds
  FETCHED_KEY: 'speakers_fetched',
}

@Injectable({
  providedIn: 'root',
})
export class SpeakerService {
  private readonly firestore = inject(Firestore);
  private readonly storageService = inject(StorageService);


  
  async getSpeakerById(speakerId: string, forceRefresh: boolean = false) {
    if (!forceRefresh) {
      const cachedSpeaker = (await this.storageService.get('speakers', speakerId, "id"))[0] as Speaker;
      if (cachedSpeaker) {
        console.log('Fetched Speaker from storage', cachedSpeaker);
        return cachedSpeaker;
      } else {
        return null;
      }
    }

    // If not in cache or forceRefresh is true, fetch from Firestore
    try {
      const docRef = doc(this.firestore, "sponors", speakerId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const speaker = docSnap.data() as Speaker;
        speaker.id = docSnap.id; // Ensure the ID is included
        console.log('Fetched speaker from Firestore', speaker);
        // Cache the speaker locally
        await this.storageService.upsert('speakers', [speaker], 'id');
        return speaker;
      } else {
        console.warn('No such speaker in Firestore:', speakerId);
        return null;
      }
    } catch (error) {
      console.error('Error fetching speaker from Firestore:', error);
      throw error;
    }
  }

  async getSpeakers(): Promise<Speaker[]> {
    console.log('Fetching speakers from Firestore...');

    const shouldRefresh = this.storageService.shouldRefresh(SPEAKERS_DB_CONF.FETCHED_KEY, SPEAKERS_DB_CONF.TTL);
    console.log('shouldRefresh', shouldRefresh);

    if (!shouldRefresh) {
      console.log('Using cached speakers data');
      const cachedSpeakers = await this.storageService.getAll('speakers') as Speaker[];
      console.log('Cached speakers:', cachedSpeakers);
      return this.sortSpeakers(cachedSpeakers);
    } else {
      const querySnapshot = await getDocs(collection(this.firestore, 'speakers'));
      await this.storageService.clearTable('speakers');
      let speakers: Speaker[] = [];
      querySnapshot.forEach((doc) => {
        const speakerData = doc.data() as Speaker;
        speakerData.id = doc.id;
        speakers.push(speakerData);
      });
      await this.storageService.upsert('speakers', speakers, 'id');
      this.storageService.updateFetchedTime(SPEAKERS_DB_CONF.FETCHED_KEY);
      return this.sortSpeakers(speakers);
    }
  }

  public async upsertSpeakers(speakers: Speaker[]) { 
    let errors: any[] = [];
    for (const speaker of speakers) {
      console.log(LOG_TAG, 'Upserting speaker', speaker.firstname, speaker.lastname);
      setDoc(doc(this.firestore, "speakers", speaker.id), speaker).then(async (res) => {
        console.log(LOG_TAG, 'Lead saved to Firestore', res);
        await this.storageService.upsert('speakers', [speaker], 'id');
      }).catch(async (error) => {
        console.error(LOG_TAG, 'Error saving lead to Firestore:', error);
        errors.push({speaker, error});
      });
    }
    return errors;
  }


  private sortSpeakers(speakers: Speaker[]): Speaker[] {
    return speakers.sort((a, b) => {
      const nameA = a.firstname.toUpperCase(); // ignore upper and lowercase
      const nameB = b.firstname.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      // names must be equal
      return 0;
    });
  }
}
