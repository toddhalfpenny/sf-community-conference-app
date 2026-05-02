import { inject, Injectable } from '@angular/core';
import {
  collection,
  getDocs,
  Firestore,
  doc,
  getDoc,
} from '@angular/fire/firestore';
import { StorageService } from '../storage/storage-service';
import { FAQ } from './faq.model';

const LOG_TAG = 'faq.servce';

const FAQ_DB_CONF = {
  TTL: 1000 * 60 * 60, // 1 hour
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
      const querySnapshot = await getDocs(collection(this.firestore, 'faqs'));
      await this.storageService.clearTable('faqs');
      let faqs: FAQ[] = [];
      querySnapshot.forEach((doc) => {
        const faqData = doc.data() as FAQ;
        faqData.id = doc.id;
        faqs.push(faqData);
      });
      await this.storageService.upsert('faqs', faqs, 'id');
      this.storageService.updateFetchedTime(FAQ_DB_CONF.FETCHED_KEY);
      return faqs.sort((a, b) => a.order - b.order);
    }
  }

}
