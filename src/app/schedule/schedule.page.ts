import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { SessionService } from '../session/session.service';
import { Session } from '../session/session.model';
import { SessionCardComponent } from "../session/session-card/session-card.component";

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
  standalone: true,
  imports: [IonButtons, IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar, CommonModule, FormsModule, IonList, SessionCardComponent]
})
export class SchedulePage implements OnInit {

  private readonly sessionService = inject(SessionService);
  protected agenda?: Session[][];
  protected timeNow: Number = 0;
  
  constructor() { 
    let timeNow = new Date();
    // These are here for testing
    // timeNow.setDate(5);
    // timeNow.setMonth(5);
    this.timeNow = new Date(timeNow).setHours(timeNow.getHours(), 0, 0 ,0).valueOf();
  }

  ngOnInit() {
  }
    async ionViewWillEnter() {
      this.agenda = await this.sessionService.getAgenda();
      console.log('Fetched agenda', this.agenda);
    }

}
