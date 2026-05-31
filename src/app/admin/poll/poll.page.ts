import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCardHeader, IonCardTitle, IonButtons, IonBackButton, IonButton, IonInput, IonIcon, IonCard, IonCardContent, IonItem, IonToggle, IonItemGroup, IonItemDivider, IonLabel, IonReorder, IonReorderGroup } from '@ionic/angular/standalone';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { create, close, save, trash, options } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import { PollService } from 'src/app/polls/poll.service';
import { Poll, PollVotes } from 'src/app/polls/poll.model';

interface ChartConf {
  datasets: {
    barThickness?: number;
    backgroundColor?: string | string[];
    borderRadius?: number;
    label: string;
    data: any[];
  }[];
  labels: string[];
  options?: ChartConfiguration['options'];
}

@Component({
  selector: 'app-poll',
  templateUrl: './poll.page.html',
  styleUrls: ['./poll.page.scss'],
  standalone: true,
  imports: [
    BaseChartDirective,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonCardHeader,
    IonCardTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonInput, IonIcon,
    IonCard,
    IonCardContent,
    IonItem, IonToggle,
    IonItemGroup,
    IonItemDivider,
    IonLabel,
    IonReorder,
    IonReorderGroup
],
})
export class PollPage implements OnInit {
  private readonly location = inject(Location);
  private readonly PollService = inject(PollService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected isEditing: boolean = false;
  protected isNewPoll: boolean = false;

  protected poll!: Poll;
  protected pollResults: PollVotes | null = null;
  protected pollResultsStr: string = '';

  protected barChartData!: ChartConf;

  protected pollForm: FormGroup = this.formBuilder.group({
    isActive: [false, Validators.required], // Add the isActive field
    isResultPublic: [false, Validators.required], // Add the isResultPublic field
  });

  constructor() {
    addIcons({ create, close, save, trash });
    const navigation = this.router.currentNavigation();
    console.log('Navigation extras:', navigation?.extras);
    if (navigation?.extras?.state) {
      this.poll = navigation?.extras?.state['poll'];
      console.log('Poll:', this.poll);
      this.poll.options.forEach((option, index) => {
        this.pollForm.addControl(`option${index}`, this.formBuilder.control(option, Validators.required));
      });
    } else {
      this.isNewPoll = true;
      // Initialize a new poll object if needed
      this.poll = {
        name: '',
        id: '',
        question: '',
        options: [],
        isActive: false,
        isResultPublic: false,
      };
    }

    const formValues: any = {
      isActive: this.poll.isActive,
      isResultPublic: this.poll.isResultPublic ?? false
    };
    this.poll.options.forEach((option, index) => {
      formValues[`option${index}`] = option;
    });

    this.pollForm.setValue(formValues);

   
  }

  async ngOnInit() {
    this.pollResults = await this.PollService.getResults(this.poll.id);
    this.pollResultsStr = JSON.stringify(this.pollResults, null, 2);
    console.log('Poll results:', this.pollResults);
    
    const dataArr: any[] = [];
    const labelsArr: string[] = [];
    let biggestIndex = 0;
    let biggestResult = 0;
    let currIndex = 0;
    for (let key in this.pollResults) {
      if (key !== 'dummy') {
        console.log(`Option: ${key}, Votes: ${this.pollResults[key]}`);
        dataArr.push(this.pollResults[key]);
        labelsArr.push(key);
        if (this.pollResults[key] > biggestResult) {
          biggestIndex = currIndex;
          biggestResult = this.pollResults[key];
        }
        currIndex++;
      }
    }
    console.log('biggestIndex', biggestIndex);
    // dataArr[biggestIndex] = biggestResult + 5;

    let backgroundColors = Array(dataArr.length).fill('rgba(35,87,137, 0.8)');
    backgroundColors[biggestIndex] = 'rgba(158,30,33, 1)';
    this.barChartData = {
      datasets: [
        {
          // barThickness: 30,
          backgroundColor: backgroundColors,
          borderRadius: 12,
          label: 'Votes',
          data: dataArr,
        },
      ],
      labels: labelsArr,
      options: {
        indexAxis: 'y',
      },
    };
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

  protected async delete() {}

  protected edit() {
    this.isEditing = true;
    this.pollForm.enable();
  }

  protected onStatusChange(event: any) {
    console.log('Status changed', event.detail.value);
    this.pollForm.patchValue({ status: event.detail.value });
  }

  protected async save() {
    this.isEditing = false;
    const updatedPoll = {
      ...this.poll,
      isActive: this.pollForm.value.isActive, // Update the isActive flag
      isResultPublic: this.pollForm.value.isResultPublic, // Update the isResultPublic flag
    };
  
    console.log('Saving poll:', updatedPoll);
    await this.PollService.upsertPolls([updatedPoll]); // Save the updated poll
    this.router.navigate(['/admin/polls'], { replaceUrl: true });
  }
}
