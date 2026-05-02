/**
 * session.service.ts
 */
import { inject, Injectable } from '@angular/core';
import {
  collection,
  getDocs,
  Firestore,
  doc,
  getDoc,
  setDoc
} from '@angular/fire/firestore';
import { Session, SessionFormat } from './session.model';
import { StorageService } from '../storage/storage-service';

const SESSIONS_DB_CONF = {
  TTL: 1000 * 60 * 60, // 1 hour
  // TTL: 1000 * 30, // 30 seconds
  FETCHED_KEY: 'sessions_fetched',
}

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly firestore = inject(Firestore);
  private readonly storageService = inject(StorageService);
  
  /**
   * Gets a sorted list of all sessions, and enriches them
   */
  async getAgenda(): Promise<Session[][]> {
    let sortedSessions = (await this.getSessions()).sort((a, b) => {
      if (a.startDateTime.seconds < b.startDateTime.seconds) {
        return -1;
      }
      if (a.startDateTime.seconds > b.startDateTime.seconds) {
        return 1;
      }
      
      // times must be equal
      if (a.room && b.room) {
        const roomA = a.room.toUpperCase();
        const roomB = b.room.toUpperCase();
        if (roomA.toUpperCase().includes('PORTER TUN')) {
          return -1;
        }
        if (roomA < roomB) {
          return -1;
        }
        if (roomA > roomB) {
          return 1;
        }
      }
      // names must be equal
      return 0;
    });
    let agenda: Session[][] = [];
    let lastHour : number = 0;
    let curHourSessions: Session[] = []
    for (const session of sortedSessions) {
      const sessionStartDateTime = new Date(session.startDateTime.seconds * 1000);
      // const sessionEndDateTime = new Date(session.endDateTime.seconds * 1000);
      console.log('Processing session', sessionStartDateTime, sessionStartDateTime.getHours(), lastHour);
      if (sessionStartDateTime.getHours() > lastHour) {
        console.log('New hour detected', sessionStartDateTime.getHours());
        lastHour = sessionStartDateTime.getHours();
        if (curHourSessions.length > 0) {
          agenda.push(JSON.parse(JSON.stringify(curHourSessions)));
          curHourSessions = [];
        }
        const dividerTitle = new Date(session.startDateTime.seconds * 1000).setHours(lastHour, 0, 0, 0).valueOf();
        curHourSessions.push({
          id: `hour-${lastHour}`,
          title: `${lastHour}:00`,
          startDateTime : {seconds: dividerTitle},
          endDateTime : {seconds: 0},
          format: SessionFormat.Divider,
        } as Session);
        curHourSessions.push(session);
      } else {
        curHourSessions.push(session);
      }
    }
    agenda.push(curHourSessions);
    return agenda;
  }

  async getSessionById(sessionId: string, forceRefresh: boolean = false) {
    if (!forceRefresh) {
      const cachedSession = (await this.storageService.get('sessions', sessionId, "id"))[0] as Session;
      if (cachedSession) {
        console.log('Fetched Session from storage', cachedSession);
        return cachedSession;
      } else {
        return null;
      }
    }

    // If not in cache or forceRefresh is true, fetch from Firestore
    try {
      const docRef = doc(this.firestore, "sponors", sessionId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const session = docSnap.data() as Session;
        session.id = docSnap.id; // Ensure the ID is included
        console.log('Fetched session from Firestore', session);
        // Cache the session locally
        await this.storageService.upsert('sessions', [session], 'id');
        return session;
      } else {
        console.warn('No such session in Firestore:', sessionId);
        return null;
      }
    } catch (error) {
      console.error('Error fetching session from Firestore:', error);
      throw error;
    }
  }

   async getSessions(): Promise<Session[]> {
      console.log('Fetching sessions from Firestore...');
  
      const shouldRefresh = this.storageService.shouldRefresh(SESSIONS_DB_CONF.FETCHED_KEY, SESSIONS_DB_CONF.TTL);
      console.log('shouldRefresh', shouldRefresh);
  
      if (!shouldRefresh) {
        console.log('Using cached sessions data');
        const cachedSessions = await this.storageService.getAll('sessions') as Session[];
        console.log('Cached sessions:', cachedSessions);
        // return this.sortSessions(cachedSessions);s
        return cachedSessions;
      } else {
        const querySnapshot = await getDocs(collection(this.firestore, 'sessions'));
        await this.storageService.clearTable('sessions');
        let sessions: Session[] = [];
        querySnapshot.forEach((doc) => {
          const sessionData = doc.data() as Session;
          sessionData.id = doc.id;
          sessions.push(sessionData);
        });
        await this.storageService.upsert('sessions', sessions, 'id');
        this.storageService.updateFetchedTime(SESSIONS_DB_CONF.FETCHED_KEY);
        // return this.sortSessions(sessions);
        return sessions;
      }
    }

    public async upsertSessions(sessions: Session[]) { 
      let errors: any[] = [];
      for (const session of sessions) {
        console.log('Upserting session', session.title);
        setDoc(doc(this.firestore, "sessions", session.id), session).then(async (res) => {
          console.log('Lead saved to Firestore', res);
          await this.storageService.upsert('sessions', [session], 'id');
        }).catch(async (error) => {
          console.error('Error saving lead to Firestore:', error);
          errors.push({session, error});
        });
      }
      return errors;
    }


}
