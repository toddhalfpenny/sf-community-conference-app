import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from './session.service';
import { type Session } from './session.model';
import { SessionCardComponent } from "./session-card/session-card.component";
import { User } from '../user/user.model';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-session',
  templateUrl: './session.page.html',
  styleUrls: ['./session.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, CommonModule, FormsModule, IonButtons, SessionCardComponent, IonTitle, IonBackButton]
})
export class SessionPage implements OnInit {

  private activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);
  private readonly userService = inject(UserService);
  
  protected session?: Session;
  protected user:User | null = null;

  constructor() { 
    const navigation = this.router.currentNavigation();
    console.log("Navigation extras:", navigation?.extras);
    if ( navigation?.extras?.state && navigation.extras.state["user"] ) {
      this.user = navigation.extras.state["user"];
    }
  }

  ngOnInit() {
  }
  async ionViewWillEnter() {
    const sessionId = this.activatedRoute.snapshot.paramMap.get('sessionId') as string;
    this.session = await this.sessionService.getSessionById(sessionId) as Session;
  }

  protected async toggleFavourite(event: any) {
    console.log('Toggling favourite for session', event);
    this.sessionService.toggleFavourite(event.sessionId, event.isFavourite);
    this.userService.toggleFavourite(event.sessionId, event.isFavourite);
  }

}
