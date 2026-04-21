import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonSplitPane,
  IonToolbar
 } from '@ionic/angular/standalone';
 import { home, person, logIn, logOut } from 'ionicons/icons';
 import { addIcons } from 'ionicons';

import { AuthenticationService } from './authentication/authentication.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    IonApp,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuToggle,
    IonRouterOutlet,
    IonSplitPane,
    IonToolbar,
    RouterLink
  ],
})
export class AppComponent {

  private readonly authenticationService = inject(AuthenticationService);
  private authubscription?: Subscription;
  
  protected appPages: any[] = [];

  constructor() {
    addIcons({ home, person, logIn, logOut });
    this.authubscription = this.authenticationService.getUser().subscribe(user => {
      console.log('User in AppComponent:', user);
      if (user) {
        this.appPages = [
          {
            title: 'Home',
            url: '/home',
            icon: 'home'
          },
          {
            title: 'Profile',
            url: '/profile',
            icon: 'person'
          },
          {
            title: 'Logout  ',
            url: '/auth/logout',
            icon: 'log-out'
          }
        ];
      } else {
        this.appPages = [
          {
            title: 'Home',
            url: '/home',
            icon: 'home'
          },
          {
            title: 'Login',
            url: '/auth/login',
            icon: 'log-in'
          }
        ];
      }
      console.log('App Pages:', this.appPages); 
    });
  }
}
