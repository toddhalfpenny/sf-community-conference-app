import { inject, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
  user,
  UserCredential,
} from '@angular/fire/auth';
import { from, Observable, Subject } from 'rxjs';
// import { UserService } from '../user/user.service';
import { StorageService } from '../storage/storage-service';

const LOG_TAG = 'authentication.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly auth = inject(Auth);
  private readonly storageService = inject(StorageService);
  // private readonly userService = inject(UserService);
  


  private _user = new Subject<Auth|null>();
  public user$ = this._user.asObservable();

  constructor() {
    console.log(`${LOG_TAG} constructor`);
    this._user.next(this.auth);
  }

  public getUser(): Observable<User | null> {
    return user(this.auth);
  }

  public async login(email: string, password: string): Promise<UserCredential> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Login successful:', credential);
      // await this.userService.setUser(credential.user.email!);
      this._user.next(this.auth);
      console.log('User data retrieved from Firestore');
      return credential;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(`Login failed: ${error.message}`);
    }
  }
  
  public logout(): Observable<void> {
    this.storageService.clearTables();
    this.storageService.clearTTL();
    this._user.next(null);
    return from(signOut(this.auth));
  }
  
  public signup(email: string, password: string): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }
  
  public async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return;
    } catch (error: any) {
      throw new Error(`resetPassword error: ${error.message}`);
    }
  }
  
}
