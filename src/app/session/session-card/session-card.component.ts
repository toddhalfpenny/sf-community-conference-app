import { Component, Input, OnInit } from '@angular/core';
import { type Session } from '../session.model';
import { DatePipe } from '@angular/common';
import { IonAvatar, IonChip, IonLabel, IonIcon, IonButton } from "@ionic/angular/standalone";
import { calendar, shareSocial, time, location } from 'ionicons/icons';
import { addIcons } from 'ionicons';


@Component({
  selector: 'app-session-card',
  templateUrl: './session-card.component.html',
  styleUrls: ['./session-card.component.scss'],
  standalone: true,
  imports: [DatePipe, IonAvatar, IonChip, IonLabel, IonIcon, IonButton]
})
export class SessionCardComponent  implements OnInit {

  @Input({required: true}) session!: Session;
  constructor() {
    addIcons({ calendar, shareSocial, time, location });
  }

  ngOnInit() {}

}
