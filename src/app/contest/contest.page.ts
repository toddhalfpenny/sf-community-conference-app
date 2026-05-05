import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonList } from '@ionic/angular/standalone';
import { Lead } from '../leads/lead.model';
import { ContestService } from './contest-service';
import  { UserService } from '../user/user-service';
import { User } from '../user/user.model';

@Component({
  selector: 'app-contest',
  templateUrl: './contest.page.html',
  styleUrls: ['./contest.page.scss'],
  standalone: true,
  imports: [IonButtons, IonContent, IonHeader, IonMenuButton, IonTitle, IonToolbar, CommonModule, FormsModule, IonList]
})
export class ContestPage implements OnInit {
  private readonly userService = inject(UserService);
  private readonly contestService = inject(ContestService);
  private user!: User;
  protected leads!: Lead[];

  constructor() { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    // TODO SUBSCRIPTION THIS
    if (!this.user) {
      this.user = await this.userService.getUser() as User;
      console.log('User in contest page', this.user);
    }
    if (this.user) {
      this.leads = await this.contestService.getContestEntries(this.user.id);
      console.log('Fetched leads', this.leads);
    }
  }

}
