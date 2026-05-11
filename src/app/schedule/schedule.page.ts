import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { SessionService } from '../session/session.service';
import { Session } from '../session/session.model';
import { SessionCardComponent } from "../session/session-card/session-card.component";
import  { UserService } from '../user/user.service';
import { User } from '../user/user.model';
import { Subscription } from 'rxjs';

const LAST_SEGEMENT_KEY = 'schedulePageLastSegment';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
  standalone: true,
  imports: [IonButtons, IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar, CommonModule, FormsModule, IonList, SessionCardComponent, IonSegment, IonSegmentButton, IonLabel]
})
export class SchedulePage implements OnInit {

  private readonly sessionService = inject(SessionService);
  private readonly userService = inject(UserService);
  private userSubscription?: Subscription;

  protected agenda?: Session[][];
  protected currentSegment: string = 'all';
  protected timeNow: Number = 0;
  protected user!: User | null;
SessionFormat: any;
  
  constructor() { 
    let timeNow = new Date();
    // These are here for testing
    // timeNow.setDate(5);
    // timeNow.setMonth(5);
    this.timeNow = new Date(timeNow).setHours(timeNow.getHours(), 0, 0 ,0).valueOf();
    this.userSubscription = this.userService.user$.subscribe((user: any) => {
      console.log('User updated', user);
      this.user = user;
      this.sessionService.getAgenda().then((agenda) => {
        this.agenda = agenda;
      }).catch((error) => {
        console.error('Error fetching agenda', error);
      });
      console.log('Fetched agenda', this.agenda);
    });
  }

  ngOnInit() {
  }
  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async ionViewWillEnter() {
    const user = this.userService.getUser();
    if (user) {
      this.user = user;
      try {
        this.agenda = await this.sessionService.getAgenda();
        console.log('Fetched agenda', this.agenda);
      } catch (error) {
        console.error('Error fetching agenda', error);
      }
    }
    this.currentSegment = localStorage.getItem(LAST_SEGEMENT_KEY) || 'all';
  }

  protected segmentChanged(event: any) {
    this.currentSegment = event.detail.value;
    localStorage.setItem(LAST_SEGEMENT_KEY, this.currentSegment);
  }

  protected async toggleFavourite(event: any) {
    console.log('Toggling favourite for session', event);
    this.sessionService.toggleFavourite(event.sessionId, event.isFavourite);
    this.userService.toggleFavourite(event.sessionId, event.isFavourite);
  }

}
