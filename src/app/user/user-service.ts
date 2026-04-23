import { inject, Injectable } from '@angular/core';
import {
  doc,
  docData,
  Firestore,
} from '@angular/fire/firestore';
import { User } from './user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly firestore = inject(Firestore);
  private user: User | null = null;

  public getUser(): User | null {
    return this.user;
  }
  
  public setUser(email: string): Promise<User | null> {
    console.log('Fetching user from Firestore', email);
    if (email) {
      const userDocRef = doc(this.firestore, `eventusers/${email}`);
      console.log('Document reference created:', userDocRef);
      const userData$ = docData(userDocRef) as Observable<User>;
      return new Promise((resolve, reject) => {
        userData$.subscribe({
          next: (user) => {
            console.log('User data received:', user);
            this.user = user;
            resolve(user);
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
}
