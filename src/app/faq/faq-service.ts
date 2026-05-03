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
import { FAQ } from './faq.model';

const LOG_TAG = 'faq.servce';

const FAQ_DB_CONF = {
  // TTL: 1000 * 60 * 60, // 1 hour
  TTL: 1000 * 30 * 10, // 10 minutes
  // TTL: 1000 * 30, // 30 seconds
  FETCHED_KEY: 'faqs_fetched',
}
@Injectable({
  providedIn: 'root',
})
export class FaqService {
  private readonly firestore = inject(Firestore);
  private readonly storageService = inject(StorageService);
  
  async getFaqs(): Promise<FAQ[]> {
    console.log('Fetching faqs from Firestore...');

    const shouldRefresh = this.storageService.shouldRefresh(FAQ_DB_CONF.FETCHED_KEY, FAQ_DB_CONF.TTL);
    console.log('shouldRefresh', shouldRefresh);

    if (!shouldRefresh) {
      console.log('Using cached faqs data');
      const cachedFaqs = await this.storageService.getAll('faqs') as FAQ[];
      console.log('Cached faqs:', cachedFaqs);
      return cachedFaqs.sort((a, b) => a.order - b.order);
    } else {
      const lastRefreshed = this.storageService.getLastFetchedTime(FAQ_DB_CONF.FETCHED_KEY);
      const collRef = collection(this.firestore, 'faqs'); 
      const q = query(collRef, where("lastModified", ">", lastRefreshed));
      const querySnapshot = await getDocs(q);
      this.storageService.updateFetchedTime(FAQ_DB_CONF.FETCHED_KEY);
      console.log(LOG_TAG, 'Fetched sponsors from Firestore, querySnapshot:', querySnapshot.docs.length);
      const updatedFaqs: FAQ[] = querySnapshot.docs.map((doc) => {
        const faqData = doc.data() as FAQ;
        faqData.id = doc.id;
        return faqData;
      });
      await this.storageService.upsert('faqs', updatedFaqs, 'id');
      const faqs = await this.storageService.getAll('faqs') as FAQ[];
      return faqs;
    }
  }

}
