import { inject, Injectable } from '@angular/core';
import {
  collection,
  getDocs,
  Firestore,
  doc,
  getDoc,
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
        sponsorData.id = doc.id;
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
