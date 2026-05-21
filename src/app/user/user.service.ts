/**
 * user.service
 * 
 * NOTE: "user" functions are for attendees, "appuser" functions are for admins, crew, sponsors, etc. This is to avoid confusion with the different data models and Firestore collections.
 */
import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  docData,
  Firestore,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { AuthenticationService } from '../authentication/authentication.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { AppUser, User, UserType } from './user.model';
import { StorageService } from '../storage/storage-service';

const LOG_TAG = 'user.servce';

const EVENTUSER_DB_CONF = {
  // TTL: 1000 * 60 * 60, // 1 hour
  TTL: 1000 * 60, // 1 min
  // TTL: 1000 * 30, // 30 seconds
  FETCHED_KEY: 'eventuser_fetched',
}

const USER_DB_CONF = {
  TTL: 1000 * 60 * 60, // 1 hour
  // TTL: 1000 * 30, // 30 seconds
  FETCHED_KEY: 'user_fetched',
}

const APPUSER_DB_CONF = {
  TTL: 1000 * 30, // 30 seconds
  FETCHED_KEY: 'appuser_fetched',
}


@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly authenticationService = inject(AuthenticationService);
  private readonly firestore = inject(Firestore);
  private readonly storageService = inject(StorageService);

  private authSubscription?: Subscription;
  private user: User | null = null;

  private _user = new Subject<User| null>();

  public user$ = this._user.asObservable();


  /*********************************************************************
   * U S E R    B I T S
   ********************************************************************/

  constructor() {
    // initialize user from local storage if available
    this.storageService.getAll('user').then(cachedUsers => {
      if (cachedUsers && cachedUsers.length > 0) {
        const cachedUser = cachedUsers[0] as User;
        console.log(LOG_TAG, 'Cached user found in storage:', cachedUser);
        // if (cachedUser.email) {
        //   this.setUser(cachedUser.email);
        // }
        this.user = cachedUser;
        this._user.next(this.user);
      } else {
        console.log(LOG_TAG, 'No cached user found in storage');
      }
    }).catch(error => {
      console.error(LOG_TAG, 'Error fetching cached user from storage:', error);
    });

    //
    this.authSubscription = this.authenticationService.getUser().subscribe((user: any) => {
      console.log(LOG_TAG, 'Constructor:user', user);
      if (user?.email) {
        this.setUser(user?.email ?? '');
      } else {
        this._user.next(null);
      }
    });
  }

  /**
   * 
   * @returns The currently set user, or null if no user is set. Note that this does not guarantee the user data is fresh - use getUserByEmail or setUser to ensure you have the latest data from Firestore.
   */
  public getUser(): User | null {
    this._user.next(this.user);
    return this.user;
  }

  public async getUsers(): Promise<User[]> {
    // TODO Implement forceRefresh and allStatuses options like sessions service (for admin view)
    try {
      console.log('Fetching eventusers from Firestore...');

      const shouldRefresh = this.storageService.shouldRefresh(EVENTUSER_DB_CONF.FETCHED_KEY, EVENTUSER_DB_CONF.TTL);
      console.log('shouldRefresh', shouldRefresh);

      if (!shouldRefresh) {
        console.log('Using cached users data');
        const cachedusers = await this.storageService.getAll('eventUsers') as User[];
        console.log('Cached users:', cachedusers);
        return this.sortUsers(cachedusers);
      } else {
        const lastRefreshed = this.storageService.getLastFetchedTime(EVENTUSER_DB_CONF.FETCHED_KEY);
        const collRef = collection(this.firestore, 'eventusers');
        const q = query(collRef, where("lastModified", ">", lastRefreshed));
        const querySnapshot = await getDocs(q);
        console.log(LOG_TAG, 'Fetched eventUsers from Firestore, querySnapshot:', querySnapshot.docs.length);
        const usersToUpdate = querySnapshot.docs.map((doc) => {
          const userData = doc.data() as User;
          userData.id = doc.id;
          return userData;
        });
        await this.storageService.upsert('eventUsers', usersToUpdate, 'id');
        this.storageService.updateFetchedTime(EVENTUSER_DB_CONF.FETCHED_KEY);
        const users = await this.storageService.getAll('eventUsers') as User[];
        console.log('Cached eventUsers:', users);
        return this.sortUsers(users);
      }
    } catch (error) {
      console.error('Error fetching users from Firestore:', error);
      throw error;
    }
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    const collRef = collection(this.firestore, 'eventusers');
    const q = query(collRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length > 0 ? (querySnapshot.docs[0].data() as User) : null; 
  }

  public async getUserById(id: any): Promise<User | null> {
    console.log(LOG_TAG, 'Fetching user by ID from Firestore...', id);
    const docRef = doc(this.firestore, 'eventusers', id);
    const docSnapshot = await getDoc(docRef);
    return docSnapshot.exists() ? (docSnapshot.data() as User) : null; 
  }
  
  public async setUser(email: string): Promise<User | null> {
    const cachedUser = (await this.storageService.getAll('user'))[0] as User;
    console.log(LOG_TAG, 'setUser:cachedUser:', cachedUser);
    const shouldRefresh = this.storageService.shouldRefresh(USER_DB_CONF.FETCHED_KEY, USER_DB_CONF.TTL);
    console.log('cachedUser:', cachedUser);

    if (cachedUser && cachedUser.email === email && !shouldRefresh) {
      console.log('Using cached user data:', cachedUser);
      this.user = cachedUser;
      this._user.next(this.user);
      return this.user;
    }

    console.log('Fetching user from Firestore', email);
    if (email) {
      try {
        const collRef = collection(this.firestore, 'eventusers');
        const q = query(collRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        const user = querySnapshot.docs.length > 0 ? (querySnapshot.docs[0].data() as User) : null; 

        this.storageService.updateFetchedTime(USER_DB_CONF.FETCHED_KEY);
        console.log('User data received from firestore:', user);
        if (user) {
          user.email = email; // Ensure email is set
          await this.storageService.upsert('user', [user], 'id');
          this.user = user;
          this._user.next(this.user);
          return this.user;
        } else {
          if (cachedUser) {
            console.log('Using cached user data:', cachedUser);
            this.user = cachedUser;
            this._user.next(this.user);
            return this.user;
          } else {
            const guestUser = await this.createGuestUser(email);
            this.user = guestUser;
            this._user.next(this.user);
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
    this._user.next(this.user);
    this.storageService.upsert('user', [this.user], 'id');
    const userDocRef = doc(this.firestore, `eventusers/${this.user.id}`);
    await setDoc(userDocRef, { myAgendaSessions: updatedFavourites }, {merge: true});
  }


  public async upsertUsers(users: User[], storeLocally: boolean = false): Promise<any[]> { 
    let errors: any[] = [];
    for (const user of users) {
      console.log(LOG_TAG, 'Upserting user', user.firstname, user.lastname);
      if (!user.id) {
        addDoc(collection(this.firestore, "eventusers"), user).then(async (res) => {
          console.log(LOG_TAG, 'User saved to Firestore', res);
          if (storeLocally) {
            user.id = res.id; // Ensure the generated ID is set on the user object for local storage
            await this.storageService.upsert('eventUsers', [user], 'id');
          }
        }).catch(async (error) => {
          console.error(LOG_TAG, 'Error saving eventusers to Firestore:', error);
          errors.push({user, error});
        });
      } else {
        setDoc(doc(this.firestore, "eventusers", user.id as string), user, {merge:true}).then(async (res) => {
          console.log(LOG_TAG, 'User saved to Firestore', res);
          if (storeLocally) {
            await this.storageService.upsert('eventUsers', [user], 'id');
          }
        }).catch(async (error) => {
          console.error(LOG_TAG, 'Error saving eventusers to Firestore:', error);
          errors.push({user, error});
        });
      }
    }
    return errors;
  }

  public async voted(pollId: string, optionId: string): Promise<void> {
    if (!this.user) {
      console.error('No user set. Cannot vote.');
      // TODO use local storage to save this action and sync when user logs in
      return;
    }
    const pollField = `voted_${pollId}`;
    (<any>this.user)[pollField] = optionId;
    this._user.next(this.user);
    this.storageService.upsert('user', [this.user], 'id');
    const userDocRef = doc(this.firestore, `eventusers/${this.user.id}`);
    await setDoc(userDocRef, { [pollField]: optionId }, {merge: true});
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

  private sortUsers(users: User[]): User[] {
    return users.sort((a, b) => {
      const nameA = a.lastname?.toUpperCase() ?? ''; // ignore upper and lowercase
      const nameB = b.lastname?.toUpperCase() ?? ''; // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      // names must be equal
      return 0;
    });
  }


  /*********************************************************************
   * A P P U S E R    B I T S
   ********************************************************************/

  public async getAppUsers(_options: {forceRefresh?: boolean} = {}): Promise<AppUser[]> {
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

  public async upsertAppUsers(users: {appUser: AppUser, sponsorId: string | null}[]): Promise<any[]> { 
    let errors: any[] = [];
    for (const user of users) {
      console.log(LOG_TAG, 'Upserting app user', user.appUser.email, user);
      const eventUser = await this.getUserByEmail(user.appUser.email);
      if (eventUser) {
        user.appUser.userId = eventUser.id as string; // Link app user to event user by email
        setDoc(doc(this.firestore, "userperms", user.appUser.email), user.appUser, {merge:true}).then(async (res) => {
          console.log(LOG_TAG, 'App user saved to Firestore', res);
          
          // Conditionally update event user with any new sponsor;
          // if (eventUser.boothStaff !== user.sponsorId || eventUser.sponsorAdmin !== user.sponsorId) {
            console.log(LOG_TAG, 'Updating event user with new sponsor access', user.sponsorId);
            let updatedEventUser: User = {}
            if (user.appUser.canManageSponsorStaff) {
              updatedEventUser.sponsorAdmin = user.sponsorId ?? "";
            } else {
              updatedEventUser.sponsorAdmin = ""
            }
            if (user.appUser.canUpsertLeads) {
              updatedEventUser.boothStaff = user.sponsorId ?? ""
            } else {
              updatedEventUser.boothStaff = ""
            }
            updatedEventUser.lastModified = new Date();
            console.log(LOG_TAG, 'Updated event user data', updatedEventUser);
            await setDoc(doc(this.firestore, "eventusers", eventUser.id as string), updatedEventUser, {merge:true});
          // }

        }).catch(async (error) => {
          console.error(LOG_TAG, 'Error saving userperms to Firestore:', error);
          errors.push({user, error});
        });
      } else {
        console.error(LOG_TAG, 'Cannot create app user without corresponding event user:', user.appUser.email);
        errors.push({user, error: 'No corresponding event user'});
      }
    }
    return errors;
  }

}
