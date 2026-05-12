import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonButtons, IonBackButton, IonRadio, IonRadioGroup, IonButton } from '@ionic/angular/standalone';
import { Poll } from '../poll.model';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.page.html',
  styleUrls: ['./poll.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonList, IonItem, IonButtons, IonBackButton, IonRadio, IonRadioGroup, IonButton]
})
export class PollPage implements OnInit {
  private readonly router = inject(Router);

  protected alreadyVoted: boolean = true;
  protected selectedOption: string | null = null;
  protected isSubmitDisabled: boolean = true;
  protected poll!: Poll;

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
    this.alreadyVoted = localStorage.getItem(`poll_${this.poll.id}_voted`) === 'true';
  }

  protected submit() {
    console.log("Submitting poll response for poll:", this.poll);
    this.isSubmitDisabled = true;
    localStorage.setItem(`poll_${this.poll.id}_voted`, 'true');
    this.alreadyVoted = true;
  }

}
