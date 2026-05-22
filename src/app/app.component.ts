import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonApp, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle, IonRouterOutlet, IonSplitPane, IonToolbar, IonFooter, IonTitle } from '@ionic/angular/standalone';
import { barChart, book, calendar, diamondOutline, gameController, home, map, notifications, people, person, logIn, logOut, scanCircle, hammer } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Subscription } from 'rxjs';

import { StorageService } from './storage/storage-service';
import { AuthenticationService } from './authentication/authentication.service';
import { User, UserType } from './user/user.model';
import { UserService } from './user/user.service';

interface AppPage {
  type: 'page' | 'seperator';
  title: string;
  url: string;
  icon: string;
}

const LOCAL_DEV = false;
const LOG_TAG = 'app.component';

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
    RouterLink,
    IonFooter,
    IonTitle
],
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  private readonly storageService = inject(StorageService);
  // private readonly authenticationService = inject(AuthenticationService);
  private readonly userService = inject(UserService);
  private userSubscription?: Subscription;
  private authSubscription?: Subscription;

  protected clientVersion: string = ((<any>window)['clientBundleVersion'] === '') ?
  '': (<any>window)['clientBundleVersion']


  private readonly openPages: AppPage[] = [
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
      title: 'Maps',
      url: '/maps',
      icon: 'map'
    },
    {
      type: 'page',
      title: 'FAQ',
      url: '/faq',
      icon: 'book'
    }
  ];

  private readonly attendeePages: AppPage[] = [
    {
      type: 'page',
      title: 'Contest',
      url: '/contest',
      icon: 'game-controller'
    },
    {
      type: 'page',
      title: 'Polls',
      url: '/polls',
      icon: 'bar-chart'
    },
    {
      type: 'page',
      title: 'Announcements',
      url: '/announcements',
      icon: 'notifications'
    }
  ];

  private readonly adminPages: AppPage[] = [
    {
      type: 'seperator',
      title: '',
      url: '',
      icon: ''
    },
    {
      type: 'page',
      title: 'Admin',
      url: '/admin',
      icon: 'hammer'
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

  private readonly guestPages: AppPage[] = [
    {
      type: 'seperator',
      title: '',
      url: '',
      icon: ''
    },
    {
      type: 'page',
      title: 'Profile',
      url: '/profile',
      icon: 'person'
    },
    {
      type: 'page',
      title: 'Login',
      url: '/auth/login',
      icon: 'log-in'
    }
  ];
  
  protected appPages: any[] = [];

  constructor() {
    (<any>window).LOCAL_DEV = location.href.includes('localhost') && LOCAL_DEV;
    addIcons({ barChart, book, calendar, diamondOutline, gameController, home, map, notifications, people, person, logIn, logOut, scanCircle, hammer });
    this.populateMenu();
    // this.authSubscription = this.authenticationService.getUser().subscribe(user => {
    //   console.log('User in AppComponent:', user);
    //   this.userService.setUser(user?.email || '').then(eventUser => {
    this.userSubscription = this.userService.user$.subscribe(eventUser => {
      // console.log(LOG_TAG, 'eventUser:', eventUser);
      this.populateMenu(eventUser);
    });
  }


  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private populateMenu(eventUser: User | null = null) {
    // console.log(LOG_TAG, 'Populating menu with eventUser:', eventUser);
    this.appPages = []; // Clear existing pages before setting new ones
    this.appPages = this.openPages; // Default to open pages
    if (eventUser) {
      this.appPages = []; // Clear existing pages before setting new ones
      this.appPages = this.openPages; // Default to open pages
      // console.log(LOG_TAG, 'Event user found, adding role-based items', JSON.stringify(this.appPages), JSON.stringify(this.openPages));
      this.appPages = [...this.appPages, ...this.attendeePages];
      if (eventUser?.type === UserType['Super-Admin'] || eventUser?.type === UserType.Admin || eventUser?.sponsorAdmin || eventUser?.boothStaff) {
        this.appPages = [...this.appPages, ...this.exhibitorPages];
      }
      if (eventUser?.type === UserType['Super-Admin'] || eventUser?.type === UserType.Admin) {
        this.appPages = [...this.appPages, ...this.adminPages];
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
          title: 'Profile',
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
      // console.log(LOG_TAG, 'No eventUser found, adding guest items');
      // // TODO - remove this
      // this.appPages = [...this.appPages, ...this.exhibitorPages];
      this.appPages = [...this.appPages, ...this.guestPages];
      // this.appPages.push(
      // );
    }
    // console.log('App Pages:', this.appPages); 
  }

}
