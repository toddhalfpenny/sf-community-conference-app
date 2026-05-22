import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonSegment, IonSegmentButton, IonSearchbar, IonButton, IonIcon, IonPopover, IonCheckbox } from '@ionic/angular/standalone';
import {  filterCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { SessionService } from '../session/session.service';
import { Session } from '../session/session.model';
import { SessionCardComponent } from "../session/session-card/session-card.component";
import  { UserService } from '../user/user.service';
import { User } from '../user/user.model';
import { Subscription } from 'rxjs';
import { AnnouncementIconComponent } from "../announcements/announcement-icon/announcement-icon.component";

const LAST_SEGEMENT_KEY = 'schedulePageLastSegment';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
  standalone: true,
  imports: [IonButtons, IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar, CommonModule, FormsModule, IonList, SessionCardComponent, IonSegment, IonSegmentButton, IonLabel, IonSearchbar, IonButton, IonIcon, IonPopover, IonItem, IonCheckbox, AnnouncementIconComponent]
})
export class SchedulePage implements OnInit {

  private readonly sessionService = inject(SessionService);
  private readonly userService = inject(UserService);
  private agendaSubscription?: Subscription;
  private userSubscription?: Subscription;

  protected agenda?: Session[][];
  protected currentSegment: string = 'all';
  protected filterTags: string[] = [];
  protected activeFilters: string[] = [];
  protected searchTerm : string = '';
  protected timeNow: Number = 0;
  protected user!: User | null;
  SessionFormat: any;
  
  constructor() { 
    addIcons({ filterCircleOutline });

    let timeNow = new Date();
    // These are here for testing
    // timeNow.setDate(5);
    // timeNow.setMonth(5);
    this.timeNow = new Date(timeNow).setHours(timeNow.getHours(), 0, 0 ,0).valueOf();

    this.agendaSubscription = this.sessionService.agenda$.subscribe((agenda: Session[][]) => {
      console.log('Agenda updated', agenda);
      this.agenda = agenda;
      this.filterTags = this.setFilterTags();
    });

    this.userSubscription = this.userService.user$.subscribe((user: any) => {
      console.log('User updated', user);
      this.user = user;
      if (user) {
        this.user = user;
      }
      try {
        this.sessionService.getAgenda();
      } catch (error) { 
        console.error('Error fetching agenda', error);
      }
    });
  }

  ngOnInit() {
  }
  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.agendaSubscription) {
      this.agendaSubscription.unsubscribe();
    }
  }

  async ionViewWillEnter() {
    this.userService.getUser();
    // this.sessionService.getAgenda();
    this.currentSegment = localStorage.getItem(LAST_SEGEMENT_KEY) || 'all';
  }


  protected handleSearchChange(event: any) {
    // console.log("handleSearchChange", event);
    this.searchTerm = event.detail.value.toLowerCase();
  }

  protected isInSearchResults(session: Session): boolean {
    if (this.searchTerm.length < 2) {
      return true;
    }
    if (this.searchTerm.length < 3) {
      console.log('Searching by tags for term', this.searchTerm);
      // Only search by tags if the search term is less than 3 characters, otherwise it becomes too slow
      if (session.tags?.some(tag => tag.toLowerCase().includes(this.searchTerm))) {
        console.log('Found match in tags for session', session.title);
        return true;
      }
      return false;
    } else {

      if (session.tags?.some(tag => tag.toLowerCase().includes(this.searchTerm))) {
        return true;
      }
      if (session.title.toLowerCase().includes(this.searchTerm)) {
        return true;
      }
      if (session.abstract.toLowerCase().includes(this.searchTerm)) {
        return true;
      }
      if (session.speakers.some(speaker => speaker.name.toLowerCase().includes(this.searchTerm))) {
        return true;
      }
      return false;
    }
  }

  protected segmentChanged(event: any) {
    this.currentSegment = event.detail.value;
    localStorage.setItem(LAST_SEGEMENT_KEY, this.currentSegment);
  }

  protected shouldShowSession(session: Session): boolean {
    if (session.format === 3) {
      return true;
    }
    if (this.currentSegment === 'all' || this.user?.myAgendaSessions?.includes(session.id!)) {
      if (this.isInSearchResults(session)) {
        if (this.activeFilters.length === 0) {
          return true;
        } else {
          // console.log('Filtering session', session.title, 'with tags', session.tags, 'against active filters', this.activeFilters);
          if (session.tags?.some(tag => this.activeFilters.includes(tag))) {
            return true;
          }
        } 
      }
    }
    return false;
  }

  protected async toggleFavourite(event: any) {
    console.log('Toggling favourite for session', event);
    this.sessionService.toggleFavourite(event.sessionId, event.isFavourite);
    this.userService.toggleFavourite(event.sessionId, event.isFavourite);
  }

  protected toggleFilter(tag: string) {
    if (this.activeFilters.includes(tag)) {
      this.activeFilters = this.activeFilters.filter(t => t !== tag);
    } else {
      this.activeFilters.push(tag);
    }
    console.log('Active filters', this.activeFilters);
  }

  private setFilterTags() {
    let tags: string[] = [];
    this.agenda?.forEach(timeSlot => {
      return timeSlot.forEach(session => {
        session.tags?.forEach(tag => {
          if (!tags.includes(tag) && tag !== 'Trigger') {
            tags.push(tag);
          }
        });
      });
    });
    // console.log('Available tags', tags);
    return tags.sort();
  }

}
