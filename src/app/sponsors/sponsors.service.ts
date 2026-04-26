import { inject, Injectable } from '@angular/core';
import {
  collection,
  getDocs,
  Firestore,
} from '@angular/fire/firestore';
import { Sponsor } from './sponsor.model';
import { StorageService } from '../storage/storage-service';

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

  
  async getSponsors(): Promise<any> {
    console.log('Fetching sponsors from Firestore...');
    let tieredSponsors: {
      'Platinum': Sponsor[],
      'Gold': Sponsor[],
      'Demo Jam': Sponsor[],
      'Stairs': Sponsor[]
    } = {
      'Platinum': [],
      'Gold': [],
      'Demo Jam': [],
      'Stairs': []
    }

    const shouldRefresh = this.storageService.shouldRefresh(SPONSORS_DB_CONF.FETCHED_KEY, SPONSORS_DB_CONF.TTL);
    console.log('shouldRefresh', shouldRefresh);

    if (!shouldRefresh) {
      console.log('Using cached sponsors data');
      const cachedSponsors = await this.storageService.getAll('sponsors') as Sponsor[];
      console.log('Cached sponsors:', cachedSponsors);
      for (const sponsorData of cachedSponsors) {
        for (let i = 0; i < sponsorData.tiers?.length; i++) {
          tieredSponsors[sponsorData.tiers[i] as keyof typeof tieredSponsors][sponsorData.order] = sponsorData;
        }
      }
      return tieredSponsors;
    } else {

      const querySnapshot = await getDocs(collection(this.firestore, 'sponsors'));
      await this.storageService.clearTable('sponsors');
      querySnapshot.forEach((doc) => {
        const sponsorData = doc.data() as Sponsor;
        console.log('Sponsor data:', sponsorData);
        this.storageService.upsert('sponsors', [sponsorData], 'name');
        for (let i = 0; i < sponsorData.tiers?.length; i++) {
          tieredSponsors[sponsorData.tiers[i] as keyof typeof tieredSponsors][sponsorData.order] = sponsorData;
          // tieredSponsors[sponsorData.tiers[i as a] as any]?.push( sponsorData);
        }
      });
      console.log('Tiered sponsors:', tieredSponsors);
      this.storageService.updateFetchedTime(SPONSORS_DB_CONF.FETCHED_KEY);
      return tieredSponsors;
    }
  }

  getTiers() : string[] {
    return ['Platinum', 'Gold', 'Demo Jam', 'Stairs'];
  }


}
