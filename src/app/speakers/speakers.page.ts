import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonList, IonAvatar, IonButton, IonIcon } from '@ionic/angular/standalone';
import { logoLinkedin, trailSign } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { SpeakerService } from  './speaker.service';
import { type Speaker } from './speaker.model';
import { SpeakerCardComponent } from './speaker-card/speaker-card.component';

@Component({
  selector: 'app-speakers',
  templateUrl: './speakers.page.html',
  styleUrls: ['./speakers.page.scss'],
  standalone: true,
  imports: [IonButtons, IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar, CommonModule, FormsModule, IonList, SpeakerCardComponent]
})
export class SpeakersPage implements OnInit {
  private readonly speakerService = inject(SpeakerService);

  protected speakers: Speaker[] = [];

  constructor() {
    addIcons({ trailSign, logoLinkedin});
  }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.speakers = await this.speakerService.getSpeakers();
  }

}
