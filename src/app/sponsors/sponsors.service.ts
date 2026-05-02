import { inject, Injectable } from '@angular/core';
import {
  collection,
  getDocs,
  Firestore,
  doc,
  getDoc,
  setDoc
} from '@angular/fire/firestore';
import { Sponsor } from './sponsor.model';
import { StorageService } from '../storage/storage-service';

const LOG_TAG = 'sponsor.servce';

const SPONSORS_DB_CONF = {
  TTL: 1000 * 60 * 60, // 1 hour
  // TTL: 1000 * 30, // 30 seconds
  FETCHED_KEY: 'sponsors_fetched',
}

@Injectable({
  providedIn: 'root',
})
export class SponsorsService {
  private readonly firestore = inject(Firestore);
  private readonly storageService = inject(StorageService);

  
  async getSponsorById(sponsorId: string, forceRefresh: boolean = false) {
    if (!forceRefresh) {
      const cachedSponsor = (await this.storageService.get('sponsors', sponsorId, "id"))[0] as Sponsor;
      if (cachedSponsor) {
        console.log('Fetched Sponsor from storage', cachedSponsor);
        return cachedSponsor;
      } else {
        return null;
      }
    }

    // If not in cache or forceRefresh is true, fetch from Firestore
    try {
      const docRef = doc(this.firestore, "sponors", sponsorId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const sponsor = docSnap.data() as Sponsor;
        console.log('Fetched sponsor from Firestore', sponsor);
        // Cache the sponsor locally
        await this.storageService.upsert('sponsors', [sponsor], 'id');
        return sponsor;
      } else {
        console.warn('No such sponsor in Firestore:', sponsorId);
        return null;
      }
    } catch (error) {
      console.error('Error fetching sponsor from Firestore:', error);
      throw error;
    }
  
  }

  async getRawSponsors(): Promise<Sponsor[]> {
    const shouldRefresh = this.storageService.shouldRefresh(SPONSORS_DB_CONF.FETCHED_KEY, SPONSORS_DB_CONF.TTL);
    console.log('shouldRefresh', shouldRefresh);

    if (!shouldRefresh) {
      console.log('Using cached sponsors data');
      const cachedSponsors = await this.storageService.getAll('sponsors') as Sponsor[];
      console.log('Cached sponsors:', cachedSponsors);
      return cachedSponsors;
    } else {
      const querySnapshot = await getDocs(collection(this.firestore, 'sponsors'));
      await this.storageService.clearTable('sponsors');
      this.storageService.updateFetchedTime(SPONSORS_DB_CONF.FETCHED_KEY);
      return querySnapshot.docs.map((doc) => {
        const sponsorData = doc.data() as Sponsor;
        sponsorData.id = doc.id;
        console.log('Sponsor data:', sponsorData);
        this.storageService.upsert('sponsors', [sponsorData], 'id');
        return sponsorData;
      });
    }
  }

  async getSponsors(): Promise<any> {
    console.log('Fetching sponsors from Firestore...');
    let tieredSponsors: {
      'Platinum': Sponsor[],
      'Gold': Sponsor[],
      'Demo Jam': Sponsor[],
      'Room & Video': Sponsor[],
      'Headshot Photographer': Sponsor[],
      'WI-FI': Sponsor[],
      'Coffee/Beverage': Sponsor[],
      'Stairs': Sponsor[]
    } = {
      'Platinum': [],
      'Gold': [],
      'Demo Jam': [],
      'Room & Video': [],
      'Headshot Photographer': [],
      'WI-FI': [],
      'Coffee/Beverage': [],
      'Stairs': []
    }

    const sponors = await this.getRawSponsors();
    for (const sponsorData of sponors) {
      for (let i = 0; i < sponsorData.tiers?.length; i++) {
        if (tieredSponsors[sponsorData.tiers[i] as keyof typeof tieredSponsors]) {
          tieredSponsors[sponsorData.tiers[i] as keyof typeof tieredSponsors][sponsorData.order] = sponsorData;
        } else {
          console.warn(`Unknown tier ${sponsorData.tiers[i]} for sponsor ${sponsorData.name}`);
        }
      }
    }
    console.log('Tiered sponsors:', tieredSponsors);
    return tieredSponsors;
  }

  getTiers() : string[] {
    return [
      'Platinum',
      'Gold',
      'Demo Jam',
      'Room & Video',
      'Headshot Photographer',
      'WI-FI',
      'Coffee/Beverage',
      'Stairs'
    ]
  }

  public async upsertSponsors(sponsors: Sponsor[]) { 
    let errors: any[] = [];
    for (const sponsor of sponsors) {
      if (sponsor.name && sponsor.name.trim() !== '') {
        console.log(LOG_TAG, 'Upserting sponsor', sponsor.name);
        setDoc(doc(this.firestore, "sponsors", sponsor.id), sponsor).then(async (res) => {
          console.log(LOG_TAG, 'Lead saved to Firestore', res);
          await this.storageService.upsert('sponsors', [sponsor], 'id');
        }).catch(async (error) => {
          console.error(LOG_TAG, 'Error saving lead to Firestore:', error);
          errors.push({sponsor, error});
        });
      }
    }
    return errors;
  }



}
