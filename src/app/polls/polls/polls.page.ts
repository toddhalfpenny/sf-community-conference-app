import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { PollService } from  '../poll.service';
import { Poll } from '../poll.model';

@Component({
  selector: 'app-polls',
  templateUrl: './polls.page.html',
  styleUrls: ['./polls.page.scss'],
  standalone: true,
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonMenuButton, IonList, IonItem, IonLabel]
})
export class PollsPage implements OnInit {
  private readonly PollService = inject(PollService);
  protected polls: Poll[] = [];

  constructor() { }

  ngOnInit() {
  }
  async ionViewWillEnter() {
    this.polls = await this.PollService.getPolls();
  }

}
