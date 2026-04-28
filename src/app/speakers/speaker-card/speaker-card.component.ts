import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonAvatar, IonButton, IonIcon, IonChip } from "@ionic/angular/standalone";
import { logoLinkedin, trailSign } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { type Speaker } from '../speaker.model';

@Component({
  selector: 'app-speaker-card',
  templateUrl: './speaker-card.component.html',
  styleUrls: ['./speaker-card.component.scss'],
  standalone: true,
  imports: [RouterLink, IonAvatar, IonButton, IonIcon, IonChip],
})
export class SpeakerCardComponent  implements OnInit {

  @Input({required: true}) speaker!: Speaker;
  @Input() showBio: boolean = false;

  constructor() {
    addIcons({ logoLinkedin, trailSign });
   }

  ngOnInit() {}

}
