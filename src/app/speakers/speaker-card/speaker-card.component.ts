import { Component, inject, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonAvatar, IonButton, IonIcon, IonChip } from "@ionic/angular/standalone";
import { logoLinkedin, trailSign } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { type Speaker } from '../speaker.model';
import { Session } from 'src/app/session/session.model';
import { SessionCardComponent } from "src/app/session/session-card/session-card.component";
import { SessionService } from 'src/app/session/session.service';
import { UserService } from 'src/app/user/user.service';
import { User } from 'src/app/user/user.model';

@Component({
  selector: 'app-speaker-card',
  templateUrl: './speaker-card.component.html',
  styleUrls: ['./speaker-card.component.scss'],
  standalone: true,
  imports: [RouterLink, IonAvatar, IonButton, IonIcon, IonChip, SessionCardComponent],
})
export class SpeakerCardComponent  implements OnInit {

  private readonly sessionService = inject(SessionService);
  private readonly userService = inject(UserService);

  @Input({required: true}) speaker!: Speaker;
  @Input() sessions: Session[]| undefined = [];
  @Input() showBio: boolean = false;
  @Input() user: User | null = null;

  constructor() {
    addIcons({ logoLinkedin, trailSign });
   }

  ngOnInit() {}

  
  protected async toggleFavourite(event: any) {
    console.log('Toggling favourite for session', event);
    this.sessionService.toggleFavourite(event.sessionId, event.isFavourite);
    this.userService.toggleFavourite(event.sessionId, event.isFavourite);
  }

}
