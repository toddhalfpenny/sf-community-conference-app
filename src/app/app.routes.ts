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
    path: 'speaker/:speakerId',
    loadComponent: () => import('./speakers/speaker.page').then( m => m.SpeakerPage)
  },
  {
    path: 'sponsors',
    loadComponent: () => import('./sponsors/sponsors.page').then( m => m.SponsorsPage)
  },
  {
    path: 'sponsor/:sponsorId',
    loadComponent: () => import('./sponsors/sponsor.page').then( m => m.SponsorPage)
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
    path: 'announcements',
    loadComponent: () => import('./announcements/announcements.page').then( m => m.AnnouncementsPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'leads',
    loadComponent: () => import('./leads/leads.page').then( m => m.LeadsPage)
  },
  {
    path: 'leads/:leadId',
    loadComponent: () => import('./leads/lead.page').then( m => m.LeadPage)
  },
  {
    path: 'scanner',
    loadComponent: () => import('./scanner/scanner.page').then( m => m.ScannerPage)
  },
  {
    path: 'session/:sessionId',
    loadComponent: () => import('./session/session.page').then( m => m.SessionPage)
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/dashboard/dashboard.page').then( m => m.DashboardPage)
  },
  {
    path: 'admin/speakers',
    loadComponent: () => import('./admin/speakers/speakers.page').then( m => m.SpeakersPage)
  },
  {
    path: 'admin/speaker/:speakerId',
    loadComponent: () => import('./admin/speaker/speaker.page').then( m => m.SpeakerPage)
  },
  {
    path: 'admin/sessions',
    loadComponent: () => import('./admin/sessions/sessions.page').then( m => m.SessionsPage)
  },
  {
    path: 'admin/session/:sessionId',
    loadComponent: () => import('./admin/session/session.page').then( m => m.SessionPage)
  },
  {
    path: 'admin/sponsors',
    loadComponent: () => import('./admin/sponsors/sponsors.page').then( m => m.SponsorsPage)
  },
  {
    path: 'admin/attendees',
    loadComponent: () => import('./admin/attendees/attendees.page').then( m => m.AttendeesPage)
  },
  {
    path: 'admin/attendee/:attendeeId',
    loadComponent: () => import('./admin/attendee/attendee.page').then( m => m.AttendeePage)
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./admin/users/users.page').then( m => m.UsersPage)
  },
  {
    path: 'admin/user/:userId',
    loadComponent: () => import('./admin/user/user.page').then( m => m.UserPage)
  },
  {
    path: 'polls',
    loadComponent: () => import('./polls/polls/polls.page').then( m => m.PollsPage)
  },
  {
    path: 'polls/:pollId',
    loadComponent: () => import('./polls/poll/poll.page').then( m => m.PollPage)
  },
  {
    path: 'admin/polls',
    loadComponent: () => import('./admin/polls/polls.page').then( m => m.PollsPage)
  },
  {
    path: 'admin/polls/:pollId',
    loadComponent: () => import('./admin/poll/poll.page').then( m => m.PollPage)
  },
];
