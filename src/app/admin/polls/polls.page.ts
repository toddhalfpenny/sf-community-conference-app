import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonList, IonItem, IonText, IonButtons, IonMenuButton } from '@ionic/angular/standalone';
import { type Poll } from '../../polls/poll.model';
import { PollService } from '../../polls/poll.service';

@Component({
  selector: 'app-polls',
  templateUrl: './polls.page.html',
  styleUrls: ['./polls.page.scss'],
  standalone: true,
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonList, IonItem, IonText, IonButtons, IonMenuButton]
})
export class PollsPage implements OnInit {
  private readonly pollService = inject(PollService);

  protected polls: Poll[] = [];

  constructor() { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.polls = await this.pollService.getPolls(true);
  }

}
