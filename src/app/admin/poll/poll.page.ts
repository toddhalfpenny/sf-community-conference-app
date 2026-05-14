import { Component, inject, OnInit } from '@angular/core';
import { CommonModule , Location} from '@angular/common';
import { FormBuilder,ReactiveFormsModule, FormGroup, FormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCardHeader, IonCardTitle, IonButtons, IonBackButton, IonButton, IonIcon, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { BaseChartDirective } from 'ng2-charts';
import { create, close, save } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import { PollService } from 'src/app/polls/poll.service';
import { Poll } from 'src/app/polls/poll.model';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.page.html',
  styleUrls: ['./poll.page.scss'],
  standalone: true,
  imports: [BaseChartDirective, FormsModule, ReactiveFormsModule, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCardHeader, IonCardTitle, IonButtons, IonBackButton, IonButton, IonIcon, IonCard, IonCardContent]
})
export class PollPage implements OnInit {

  private readonly location = inject(Location);
  private readonly PollService = inject(PollService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected isEditing: boolean = false;
  protected isNewPoll: boolean = false;

  protected poll!: Poll;
  protected pollResults: {option: string, votes: number}[] | null = null;

  protected barChartData = {
      datasets: [{
        data: [20, 10],
      }],
      labels: ['a', 'b'],
      options: {
        indexAxis: 'x',
      }
    }
   
  protected pollForm: FormGroup = this.formBuilder.group({
  });

  constructor() {
    addIcons({ create, close, save });
    const navigation = this.router.currentNavigation();
    console.log("Navigation extras:", navigation?.extras);
    if (navigation?.extras?.state) {
      this.poll = navigation?.extras?.state["poll"];
      console.log("Poll:", this.poll);
    }}

  async ngOnInit() {
    const res = await this.PollService.getResults(this.poll.id);
    console.log("res", res);

  }

  protected async cancel() {
    const alert = document.createElement('ion-alert');
    alert.header = 'Cancel?';
    alert.message = 'Cancelling will lose any unsaved data.';
    alert.buttons = [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Alert canceled');
        },
      },
      {
        text: 'OK',
        role: 'confirm',
        handler: () => {
          console.log('Alert confirmed');
          this.location.back();
        },
      },
    ];


    document.body.appendChild(alert);
    await alert.present();
  }

  protected async delete() {
  }

  protected edit() {
    this.isEditing = true;
    this.pollForm.enable();
  }

  protected onStatusChange(event:any) {
    console.log('Status changed', event.detail.value);
    this.pollForm.patchValue({status: event.detail.value});
  }

  protected async save() {
    this.isEditing = false;
    const timeNow= new Date();
    console.log('Form values', JSON.stringify(this.pollForm.value));
    // const updatedUser: Poll = {

    // };
    // console.log('Saving attendee:', updatedUser);
    // await this.userService.upsertUsers([updatedUser], true);
    this.router.navigate(['/admin/polls'], { replaceUrl:true });
  }
    
  

}
