import { Component, Input, OnInit } from '@angular/core';
import { type Session } from '../session.model';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonAvatar, IonChip, IonLabel, IonIcon, IonButton } from "@ionic/angular/standalone";
import { calendar, shareSocial, time, location } from 'ionicons/icons';
import { addIcons } from 'ionicons';


@Component({
  selector: 'app-session-card',
  templateUrl: './session-card.component.html',
  styleUrls: ['./session-card.component.scss'],
  standalone: true,
  imports: [RouterLink, DatePipe, IonAvatar, IonChip, IonLabel, IonIcon, IonButton]
})
export class SessionCardComponent  implements OnInit {

  @Input({required: true}) session!: Session;
  @Input() showSpeakers: boolean = true;
  constructor() {
    addIcons({ calendar, shareSocial, time, location });
  }

  ngOnInit() {}

}
