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
 import { book, calendar, diamondOutline, gameController, home, map, megaphone, people, person, logIn, logOut, scanCircle, diamond } from 'ionicons/icons';
 import { addIcons } from 'ionicons';
 import { Subscription } from 'rxjs';

import { AuthenticationService } from './authentication/authentication.service';
import { UserType } from './user/user.model';
import { UserService } from './user/user-service';

interface AppPage {
  type: 'page' | 'seperator';
  title: string;
  url: string;
  icon: string;
}


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
  private readonly userService = inject(UserService);
  private authubscription?: Subscription;

  private readonly attendeePages: AppPage[] = [
    {
      type: 'page',
      title: 'Home',
      url: '/home',
      icon: 'home'
    },
    {
      type: 'page',
      title: 'Schedule',
      url: '/schedule',
      icon: 'calendar'
    },
    {
      type: 'page',
      title: 'Speakers',
      url: '/speakers',
      icon: 'people'
    },
    {
      type: 'page',
      title: 'Sponsors',
      url: '/sponsors',
      icon: 'diamond-outline'
    },
    {
      type: 'page',
      title: 'Contest',
      url: '/contest',
      icon: 'game-controller'
    },
    {
      type: 'page',
      title: 'Maps',
      url: '/maps',
      icon: 'map'
    },
    {
      type: 'page',
      title: 'FAQ',
      url: '/faq',
      icon: 'book'
    },
    {
      type: 'page',
      title: 'Announcements',
      url: '/announcements',
      icon: 'megaphone'
    }
  ];
  private readonly exhibitorPages: AppPage[] = [
    {
      type: 'seperator',
      title: '',
      url: '',
      icon: ''
    },
    {
      type: 'page',
      title: 'Leads',
      url: '/leads',
      icon: 'scan-circle'
    }
  ];
  
  protected appPages: any[] = [];

  constructor() {
    addIcons({ book, calendar, diamondOutline, gameController, home, map, megaphone, people, person, logIn, logOut, scanCircle });
    this.authubscription = this.authenticationService.getUser().subscribe(user => {
      console.log('User in AppComponent:', user);
      this.userService.setUser(user?.email || '').then(eventUser => {
        console.log('Event user in AppComponent:', eventUser);
        this.appPages = this.attendeePages; // Default to attendee pages
        if (user) {
          if (eventUser?.type === UserType['Super-Admin'] || eventUser?.type === UserType.Admin || eventUser?.type === UserType.Exhibitor || eventUser?.type === UserType['Exhibitor-Admin']) {
            this.appPages = [...this.appPages, ...this.exhibitorPages];
          }
          this.appPages.push(
            {
              type: 'seperator',
              title: '',
              url: '',
              icon: ''
            },
            {
              type: 'page',
              title: 'profile',
              url: '/profile',
              icon: 'person'
            },
            {
              type: 'page',
              title: 'Logout  ',
              url: '/auth/logout',
              icon: 'log-out'
            }
          );
        } else {
          this.appPages.push(
            {
              type: 'seperator',
              title: '',
              url: '',
              icon: ''
            },
            {
              type: 'page',
              title: 'Login',
              url: '/auth/login',
              icon: 'log-in'
            }
          );
        }
        console.log('App Pages:', this.appPages); 
      }).catch(error => {
        console.error('Error setting user in AppComponent:', error);
      });
    });
  }
}
