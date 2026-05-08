/**
 * user.service
 * 
 * NOTE: "user" functions are for attendees, "appuser" functions are for admins, crew, sponsors, etc. This is to avoid confusion with the different data models and Firestore collections.
 */
import { inject, Injectable } from '@angular/core';
import {
  collection,
  doc,
  docData,
  Firestore,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AppUser, User, UserType } from './user.model';
import { StorageService } from '../storage/storage-service';

const LOG_TAG = 'user.servce';

const EVENTUSER_DB_CONF = {
  TTL: 1000 * 60 * 60, // 1 hour
  // TTL: 1000 * 30, // 30 seconds
  FETCHED_KEY: 'eventuser_fetched',
}
const APPUSER_DB_CONF = {
  TTL: 1000 * 30, // 30 seconds
  FETCHED_KEY: 'appuser_fetched',
}


@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly firestore = inject(Firestore);
  private readonly storageService = inject(StorageService);

  private user: User | null = null;


  /*********************************************************************
   * U S E R    B I T S
   ********************************************************************/
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
      return this.user;
    }

    console.log('Fetching user from Firestore', email);
    if (email) {
      try {
        const collRef = collection(this.firestore, 'eventusers');
        const q = query(collRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        const user = querySnapshot.docs.length > 0 ? (querySnapshot.docs[0].data() as User) : null; 

        this.storageService.updateFetchedTime(EVENTUSER_DB_CONF.FETCHED_KEY);
        console.log('User data received:', user);
        if (user) {
          user.email = email; // Ensure email is set
          await this.storageService.upsert('eventUsers', [user], 'id');
          this.user = user;
          return this.user;
        } else {
          if (cachedUser) {
            console.log('Using cached user data:', cachedUser);
            this.user = cachedUser;
            return this.user;
          } else {
            const guestUser = await this.createGuestUser(email);
            this.user = guestUser;
            return this.user;
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
      }
    } else {
      return null;
    }
  }
  
  public async setUserDEPRECATED(email: string): Promise<User | null> {
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

  public async toggleFavourite(sessionId: string, isFavourite: boolean): Promise<void> {
    if (!this.user) {
      console.error('No user set. Cannot toggle favourite.');
      // TODO use local storage to save this action and sync when user logs in
      return;
    }
    const updatedFavourites = isFavourite
      ? [...(this.user.myAgendaSessions || []), sessionId]
      : (this.user.myAgendaSessions || []).filter(id => id !== sessionId);

    this.user.myAgendaSessions = updatedFavourites;
    this.storageService.upsert('eventUsers', [this.user], 'id');
    const userDocRef = doc(this.firestore, `eventusers/${this.user.id}`);
    await setDoc(userDocRef, { myAgendaSessions: updatedFavourites }, {merge: true});
  }


  public async upsertUsers(users: User[]) { 
    let errors: any[] = [];
    for (const user of users) {
      console.log(LOG_TAG, 'Upserting user', user.firstname, user.lastname);
      setDoc(doc(this.firestore, "eventusers", user.id as string), user, {merge:true}).then(async (res) => {
        console.log(LOG_TAG, 'User saved to Firestore', res);
        // await this.storageService.upsert('users', [user], 'id');
      }).catch(async (error) => {
        console.error(LOG_TAG, 'Error saving eventusers to Firestore:', error);
        errors.push({user, error});
      });
    }
    return errors;
  }


  private async createGuestUser(email: string): Promise<User> {
    const guestUser: User = {
      id: "guest",
      email: email,
      type: UserType.Guest
    };
    console.log('Creating guest user:', guestUser);
    await this.storageService.upsert('eventUsers', [guestUser], 'id');
    return guestUser;
  } 


  /*********************************************************************
   * A P P U S E R    B I T S
   ********************************************************************/

  async getAppUsers(options: {forceRefresh?: boolean} = {}): Promise<AppUser[]> {
    console.log('Fetching app users...');
     
    const lastRefreshed = this.storageService.getLastFetchedTime(APPUSER_DB_CONF.FETCHED_KEY);
    const collRef = collection(this.firestore, 'userperms');
    // const q = query(collRef, where("lastModified", ">", lastRefreshed));
    const q = query(collRef);
    const querySnapshot = await getDocs(q);
    const appUsers = querySnapshot.docs.map((doc) => {
      const appUserData = doc.data() as AppUser;
      appUserData.email = doc.id;
      return appUserData;
    });
    this.storageService.updateFetchedTime(APPUSER_DB_CONF.FETCHED_KEY);
    return appUsers;
  }
}
