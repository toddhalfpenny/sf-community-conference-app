import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonButtons, IonBackButton, IonRadio, IonRadioGroup, IonButton } from '@ionic/angular/standalone';
import { PollService } from  '../poll.service';
import { Poll } from '../poll.model';
import { UserService } from 'src/app/user/user.service';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.page.html',
  styleUrls: ['./poll.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonList, IonItem, IonButtons, IonBackButton, IonRadio, IonRadioGroup, IonButton]
})
export class PollPage implements OnInit {
  private readonly PollService = inject(PollService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  protected alreadyVoted: boolean = true;
  protected selectedOption: string | null = null;
  protected isSubmitDisabled: boolean = true;
  protected poll!: Poll;
  protected user?: User;

  constructor() { 
    const navigation = this.router.currentNavigation();
    console.log("Navigation extras:", navigation?.extras);
    if (navigation?.extras?.state) {
      this.poll = navigation?.extras?.state["poll"];
      console.log("Poll:", this.poll);
    }
  }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.user = await this.userService.getUser() as User;
    console.log("User:", this.user);
    if (this.user) {
      this.alreadyVoted = (<any>this.user)[`voted_${this.poll.id}`] ? true : false;
      // this.alreadyVoted = false
    } else {
      this.alreadyVoted = true; // If user is not logged in, treat as already voted to disable voting
    }
  }

  protected submit() {
    this.PollService.vote(this.poll.id, this.selectedOption!);
    this.isSubmitDisabled = true;
    // localStorage.setItem(`poll_${this.poll.id}_voted`, 'true');
    this.alreadyVoted = true;
  }

}
