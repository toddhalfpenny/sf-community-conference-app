import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./authentication/authentication.routes').then((m) => m.routes),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then( m => m.HomePage)
  },
  {
    path: 'schedule',
    loadComponent: () => import('./schedule/schedule.page').then( m => m.SchedulePage)
  },
  {
    path: 'speakers',
    loadComponent: () => import('./speakers/speakers.page').then( m => m.SpeakersPage)
  },
  {
    path: 'sponsors',
    loadComponent: () => import('./sponsors/sponsors.page').then( m => m.SponsorsPage)
  },
  {
    path: 'contest',
    loadComponent: () => import('./contest/contest.page').then( m => m.ContestPage)
  },
  {
    path: 'maps',
    loadComponent: () => import('./maps/maps.page').then( m => m.MapsPage)
  },
  {
    path: 'faq',
    loadComponent: () => import('./faq/faq.page').then( m => m.FaqPage)
  },
  {
    path: 'annoucements',
    loadComponent: () => import('./annoucements/annoucements.page').then( m => m.AnnoucementsPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then( m => m.ProfilePage)
  },
];
