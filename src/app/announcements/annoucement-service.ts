/**
 * annoucement-service.ts
 * 
 * TODO
 * - Config announcements
 */ 
import { inject, Injectable } from '@angular/core';
import { collection, getDocs, Firestore, doc, getDoc, setDoc, query, where } from '@angular/fire/firestore';
import { AnnouncementType, type Announcement } from './announcement.model';
import { StorageService } from '../storage/storage-service';
import { Subject } from 'rxjs';

const LOG_TAG = 'announcement.service';

const ANNOUNCEMENT_DB_CONF = {
  // TTL: 1000 * 60 * 60, // 1 hour
  TTL: 1000 * 60 * 10, // 10 minutes
  // TTL: 1000 * 30, // 30 seconds
  ADMIN_TTL: 1000 * 30, // 30 seconds
  FETCHED_KEY: 'announcements_fetched',
}
const DEFAULT_TIMER_INTERVAL = 1000 * 60 * 5; // 10 minutes
// const DEFAULT_TIMER_INTERVAL = 1000 * 30; // 30 seconds

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  private readonly firestore = inject(Firestore);
  private readonly storageService = inject(StorageService);
  private _announcements = new Subject<Announcement[]>();
  private timerId?: number;

  public announcements$ = this._announcements.asObservable();

  constructor() {
    this.fetchAnnoncementsFromStorage();
    if (this.storageService.shouldRefresh(ANNOUNCEMENT_DB_CONF.FETCHED_KEY, ANNOUNCEMENT_DB_CONF.TTL)) {
      this.fetchNewAnnouncements();
    }
    this.timerId = window.setInterval(() => {
      this.fetchNewAnnouncements();
    }, DEFAULT_TIMER_INTERVAL);
  }

  public getAnnouncements() {
    this.fetchAnnoncementsFromStorage();
  }

  public async getAllAnnouncements(): Promise<Announcement[]> {
    await this.fetchNewAnnouncements(true);
    return await this.storageService.getAll('announcements') as Announcement[];
  }




  public async markAsRead(announcement: Announcement) {
    announcement.isRead = true;
    await this.storageService.upsert('announcements', [announcement], 'id');
    this.fetchAnnoncementsFromStorage();
    return;
  }

  private async fetchAnnoncementsFromStorage() {
    const timeNow = Date.now().valueOf() / 1000;
    const announcements = (await this.storageService.getAll('announcements') as Announcement[]).filter(announcement => {
      return (
        announcement.type === AnnouncementType.Announcement &&
        announcement.isActive &&
        announcement.notificationTime.seconds <= timeNow

      );

    });
    this._announcements.next(announcements.sort((a, b) => b.notificationTime.seconds - a.notificationTime.seconds));
    return;
  }

  public upsertAnnouncements(announcements: Announcement[]) {
    console.warn(LOG_TAG, 'TODO => Upsert announcement', announcements);
    const timeNow = new Date();
    try {
      let errors: any[] = [];
      for (const announcement of announcements) {
        delete announcement.isRead;
        announcement.lastModified = timeNow;
        console.log('Upserting announcement', announcement);
        if (announcement.id) {
          setDoc(doc(this.firestore, "announcements", announcement.id), announcement, {merge: true}).then(async (res) => {
            console.log('announcement saved to Firestore', res);
          }).catch(async (error) => {
            console.error('Error saving announcement to Firestore:', error);
            errors.push({announcement, error});
          });
        } else {
          const newDocRef = doc(collection(this.firestore, "announcements"));
          announcement.id = newDocRef.id;
          setDoc(newDocRef, announcement).then(async (res) => {
            console.log('announcement saved to Firestore', res);
          }).catch(async (error) => {
            console.error('Error saving announcement to Firestore:', error);
            errors.push({announcement, error});
          });
        }
      }
      return errors;
    } catch (error) {
      console.error(LOG_TAG, 'Error upserting announcements:', error);
      throw error;
    }
  }

  private async fetchNewAnnouncements(allStatuses: boolean = false) {
    console.log(LOG_TAG, 'Fetching new announcements');
    const lastRefreshed = this.storageService.getLastFetchedTime(ANNOUNCEMENT_DB_CONF.FETCHED_KEY);
    const collRef = collection(this.firestore, 'announcements');
    const q = query(collRef, where("lastModified", ">", lastRefreshed));
    const querySnapshot = await getDocs(q);
    const updatedAnnouncements = querySnapshot.docs.map((doc) => {
      const announcementData = doc.data() as Announcement;
      announcementData.id = doc.id;
      if (announcementData.type === AnnouncementType.Config) {
        // TODO Action to the config update
        announcementData.isRead = true;
      }
      return announcementData;
    });
    console.log(LOG_TAG, 'Fetched updated announcements', updatedAnnouncements);

    // Mark any existing announcements as read
    const existingAnnouncements = await this.storageService.getAll('announcements') as Announcement[];
    for (const updatedAnnouncement of updatedAnnouncements) {
      const existingAnnouncement = existingAnnouncements.find(a => a.id === updatedAnnouncement.id);
      if (existingAnnouncement) {
        updatedAnnouncement.isRead = existingAnnouncement.isRead;
      }
    }

    await this.storageService.upsert('announcements', updatedAnnouncements, 'id', allStatuses);
    this.storageService.updateFetchedTime(ANNOUNCEMENT_DB_CONF.FETCHED_KEY);
    await this.fetchAnnoncementsFromStorage();
    return;
  }

}
