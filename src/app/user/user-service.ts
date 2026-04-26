/**
 * user.service
 * 
 */
import { inject, Injectable } from '@angular/core';
import {
  doc,
  docData,
  Firestore,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User, UserType } from './user.model';
import { StorageService } from '../storage/storage-service';

const EVENTUSER_DB_CONF = {
  TTL: 1000 * 60 * 60, // 1 hour
  // TTL: 1000 * 30, // 30 seconds
  FETCHED_KEY: 'eventuser_fetched',
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly firestore = inject(Firestore);
  private readonly storageService = inject(StorageService);

  private user: User | null = null;

  public getUser(): User | null {
    return this.user;
  }
  
  public async setUser(email: string): Promise<User | null> {
    const cachedUser = (await this.storageService.getAll('eventUsers'))[0] as User;
    console.log('cachedUser:', cachedUser);
    const shouldRefresh = this.storageService.shouldRefresh(EVENTUSER_DB_CONF.FETCHED_KEY, EVENTUSER_DB_CONF.TTL);
    console.log('cachedUser:', cachedUser);

    if (cachedUser && cachedUser.email === email && !shouldRefresh) {
      console.log('Using cached user data:', cachedUser);
      this.user = cachedUser;
      return Promise.resolve(this.user);
    }

    console.log('Fetching user from Firestore', email);
    if (email) {
      // TODO CHECK eventuser cache, timeout etc
      const userDocRef = doc(this.firestore, `eventusers/${email}`);
      console.log('Document reference created:', userDocRef);
      const userData$ = docData(userDocRef) as Observable<User>;
      this.storageService.updateFetchedTime(EVENTUSER_DB_CONF.FETCHED_KEY);
      return new Promise(async (resolve, reject) => {
        userData$.subscribe({
          next: (user) => {
            console.log('User data received:', user);
            if (user) {
              user.email = email; // Ensure email is set
              this.storageService.upsert('eventUsers', [user], 'email').then(() => {
                this.user = user;
                resolve(this.user);
              }).catch((error) => {
                console.error('Error creating guest user:', error);
                reject(error);
              });
            } else {
              if (cachedUser) {
                console.log('Using cached user data:', cachedUser);
                this.user = cachedUser;
                resolve(this.user);
              } else {
                this.createGuestUser(email).then((guestUser) => {
                  this.user = guestUser;
                  resolve(this.user);
                }).catch((error) => {
                  console.error('Error creating guest user:', error);
                  reject(error);
                });
              }
            }
          },
          error: (error) => {
            console.error('Error fetching user data:', error);
            reject(error);
          }
        });
      });
    } else {
      return Promise.resolve(null);
    }
  }


  private async createGuestUser(email: string): Promise<User> {
    const guestUser: User = {
      email,
      type: UserType.Guest
    };
    console.log('Creating guest user:', guestUser);
    await this.storageService.upsert('eventUsers', [guestUser], 'email');
    return guestUser;
  } 
}
