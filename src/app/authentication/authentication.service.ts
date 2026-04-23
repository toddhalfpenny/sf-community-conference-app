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
import { from, Observable } from 'rxjs';
import { UserService } from '../user/user-service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly auth = inject(Auth);
  private readonly userService = inject(UserService);
  
  public getUser(): Observable<User | null> {
    return user(this.auth);
  }

  public login(email: string, password: string): Observable<UserCredential> {
    signInWithEmailAndPassword(this.auth, email, password).then((credential) => {
      console.log('Login successful:', credential);
      return this.userService.setUser(credential.user.email!);
    }).then((user) => {
      console.log('User data retrieved from Firestore:', user);
      return from(new Promise<void>((resolve) => resolve()));
    }).catch((error) => {
      console.error('Login error:', error);
    });
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }
  
  public logout(): Observable<void> {
    return from(signOut(this.auth));
  }
  
  public signup(email: string, password: string): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }
  
  public resetPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }
  
}
