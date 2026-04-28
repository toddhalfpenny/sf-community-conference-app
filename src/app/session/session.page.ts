import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { SessionService } from './session.service';
import { type Session } from './session.model';

@Component({
  selector: 'app-session',
  templateUrl: './session.page.html',
  styleUrls: ['./session.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton]
})
export class SessionPage implements OnInit {

  private activatedRoute = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly sessionService = inject(SessionService);
  
  protected session?: Session;

  constructor() { }

  ngOnInit() {
  }
  async ionViewWillEnter() {
    const sessionId = this.activatedRoute.snapshot.paramMap.get('sessionId') as string;
    this.session = await this.sessionService.getSessionById(sessionId) as Session;
  }

}
