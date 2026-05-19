/**
 * SponsorsService
 * 
 * NOTE: Halfway-through turning this to use signals
 */
import { inject, Injectable, signal, Signal } from '@angular/core';
import {
  collection,
  getDocs,
  Firestore,
  doc,
  getDoc,
  query,
  setDoc,
  where
} from '@angular/fire/firestore';
import { Sponsor } from './sponsor.model';
import { StorageService } from '../storage/storage-service';

interface TieredSponsors {
  'Platinum'?: Sponsor[],
  'Gold'?: Sponsor[],
  'Demo Jam'?: Sponsor[],
  'Room & Video'?: Sponsor[],
  'Headshot Photographer'?: Sponsor[],
  'WI-FI'?: Sponsor[],
  'Coffee/Beverage'?: Sponsor[],
  'Stairs'?: Sponsor[]
}

const LOG_TAG = 'sponsor.servce';

const SPONSORS_DB_CONF = {
  // TTL: 1000 * 60 * 60, // 1 hour
  TTL: 1000 * 30 * 10, // 10 minutes
  // TTL: 1000 * 30, // 30 seconds
  FETCHED_KEY: 'sponsors_fetched',
}

@Injectable({
  providedIn: 'root',
})
export class SponsorsService {
  private readonly firestore = inject(Firestore);
  private readonly storageService = inject(StorageService);

  private sponsorsSignal = signal<TieredSponsors>({});
  readonly sponsors$ = this.sponsorsSignal.asReadonly();

  constructor() {
    this.setCachedSponsors();
  }
  
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
    // TODO Implement forceRefresh and allStatuses options like sessions service (for admin view)
    const shouldRefresh = this.storageService.shouldRefresh(SPONSORS_DB_CONF.FETCHED_KEY, SPONSORS_DB_CONF.TTL);
    console.log('shouldRefresh', shouldRefresh);

    if (!shouldRefresh) {
      console.log('Using cached sponsors data');
      const cachedSponsors = await this.storageService.getAll('sponsors') as Sponsor[];
      return cachedSponsors;
    } else {
      const lastRefreshed = this.storageService.getLastFetchedTime(SPONSORS_DB_CONF.FETCHED_KEY);
      const collRef = collection(this.firestore, 'sponsors');
      const q = query(collRef, where("lastModified", ">", lastRefreshed));
      const querySnapshot = await getDocs(q);
      this.storageService.updateFetchedTime(SPONSORS_DB_CONF.FETCHED_KEY);
      console.log(LOG_TAG, 'Fetched sponsors from Firestore, querySnapshot:', querySnapshot.docs.length);
      const sponsorsToUpdate = querySnapshot.docs.map((doc) => {
        const sponsorData = doc.data() as Sponsor;
        sponsorData.id = doc.id;
        console.log('Sponsor data:', sponsorData);
        return sponsorData;
      });
      await this.storageService.upsert('sponsors', sponsorsToUpdate, 'id');
      const sponors = await this.storageService.getAll('sponsors') as Sponsor[];
      return sponors;
    }
  }

  async getSponsors(): Promise<any> {
    console.log('Fetching sponsors from Firestore...');
    let tieredSponsors: TieredSponsors = {
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
          (tieredSponsors[sponsorData.tiers[i] as keyof typeof tieredSponsors] ??= [])[sponsorData.order] = sponsorData;
        } else {
          console.warn(`Unknown tier ${sponsorData.tiers[i]} for sponsor ${sponsorData.name}`);
        }
      }
    }
    console.log('Tiered sponsors:', tieredSponsors);
    return tieredSponsors;
  }

  public async refreshSponsors(): Promise<void> {
    // TODO Implement forceRefresh and allStatuses options like sessions service (for admin view)
    const shouldRefresh = this.storageService.shouldRefresh(SPONSORS_DB_CONF.FETCHED_KEY, SPONSORS_DB_CONF.TTL);
    console.log(LOG_TAG, "refreshSponsors", 'shouldRefresh:', shouldRefresh);

    if (!shouldRefresh) {
      console.log(LOG_TAG, "Not refreshing sponsors");
      return;
    } else {
      const lastRefreshed = this.storageService.getLastFetchedTime(SPONSORS_DB_CONF.FETCHED_KEY);
      const collRef = collection(this.firestore, 'sponsors');
      const q = query(collRef, where("lastModified", ">", lastRefreshed));
      const querySnapshot = await getDocs(q);
      this.storageService.updateFetchedTime(SPONSORS_DB_CONF.FETCHED_KEY);
      console.log(LOG_TAG, 'Fetched sponsors from Firestore, querySnapshot:', querySnapshot.docs.length);
      const sponsorsToUpdate = querySnapshot.docs.map((doc) => {
        const sponsorData = doc.data() as Sponsor;
        sponsorData.id = doc.id;
        console.log('Sponsor data:', sponsorData);
        return sponsorData;
      });
      await this.storageService.upsert('sponsors', sponsorsToUpdate, 'id');
      const sponors = await this.tierSponsors(await this.storageService.getAll('sponsors') as Sponsor[]);
      console.log(LOG_TAG, 'refreshSponsors - sponsors:', sponors);
      this.sponsorsSignal.set(sponors);
      return;
    }
  }

  public getTiers() : string[] {
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

  private async setCachedSponsors() {
    console.log(LOG_TAG, 'Setting cached sponsors on service initialization');
    const cachedSponsors = await this.storageService.getAll('sponsors') as Sponsor[];
    const updatedSponsors = await this.tierSponsors(cachedSponsors);
    console.log(LOG_TAG, 'setCachedSponsors - Cached sponsors:', updatedSponsors);
    this.sponsorsSignal.set(updatedSponsors);
  }

  private async tierSponsors(sponsors: Sponsor[]): Promise<TieredSponsors> {
    let tieredSponsors:TieredSponsors = {
      'Platinum': [],
      'Gold': [],
      'Demo Jam': [],
      'Room & Video': [],
      'Headshot Photographer': [],
      'WI-FI': [],
      'Coffee/Beverage': [],
      'Stairs': []
    }
    for (const sponsorData of sponsors) {
      for (let i = 0; i < sponsorData.tiers?.length; i++) {
        if (tieredSponsors[sponsorData.tiers[i] as keyof typeof tieredSponsors]) {
          (tieredSponsors[sponsorData.tiers[i] as keyof typeof tieredSponsors] ??= [])[sponsorData.order] = sponsorData;
        } else {
          console.warn(`Unknown tier ${sponsorData.tiers[i]} for sponsor ${sponsorData.name}`);
        }
      }
    }
    console.log('Tiered sponsors:', tieredSponsors);
    return tieredSponsors;
  }

}
