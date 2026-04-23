import { inject, Injectable } from '@angular/core';
import {
  collection,
  getDocs,
  Firestore,
} from '@angular/fire/firestore';
import { Sponsor } from './sponsor.model';
import { Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SponsorsService {
  private readonly firestore = inject(Firestore);
  private activeSubscription?: Subscription;

  
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

    const querySnapshot = await getDocs(collection(this.firestore, 'sponsors'));
    querySnapshot.forEach((doc) => {
      const sponsorData = doc.data() as Sponsor;
      console.log('Sponsor data:', sponsorData);
      for (let i = 0; i < sponsorData.tiers.length; i++) {
        tieredSponsors[sponsorData.tiers[i] as keyof typeof tieredSponsors][sponsorData.order] = sponsorData;
        // tieredSponsors[sponsorData.tiers[i as a] as any]?.push( sponsorData);
      }
    });
    console.log('Tiered sponsors:', tieredSponsors);
    return tieredSponsors;
  }

  getTiers() : string[] {
    return ['Platinum', 'Gold', 'Demo Jam', 'Stairs'];
  }
}
