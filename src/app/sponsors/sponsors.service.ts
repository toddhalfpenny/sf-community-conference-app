import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  Firestore,
} from '@angular/fire/firestore';
import { Sponsor } from './sponsor.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SponsorsService {
  private readonly firestore = inject(Firestore);
  
  getSponsors() {
    console.log('Fetching sponsors from Firestore...');
    const sponsorsCollection = collection(this.firestore, 'sponsors');
    console.log('Sponsors collection reference:', sponsorsCollection);
    return collectionData(sponsorsCollection, { idField: 'id' }) as Observable<Sponsor[]>;
  }
}
