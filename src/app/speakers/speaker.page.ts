import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { SpeakerCardComponent } from "./speaker-card/speaker-card.component";
import { ActivatedRoute } from '@angular/router';
import { SpeakerService } from './speaker.service';
import { type Speaker } from './speaker.model';

@Component({
  selector: 'app-speaker',
  templateUrl: './speaker.page.html',
  styleUrls: ['./speaker.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, SpeakerCardComponent]
})
export class SpeakerPage implements OnInit {

  private activatedRoute = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly speakerService = inject(SpeakerService);
  
  protected speaker?: Speaker;

  constructor() { }

  ngOnInit() {
  }
  async ionViewWillEnter() {
    const speakerId = this.activatedRoute.snapshot.paramMap.get('speakerId') as string;
    this.speaker = await this.speakerService.getSpeakerById(speakerId) as Speaker;
  }

}
