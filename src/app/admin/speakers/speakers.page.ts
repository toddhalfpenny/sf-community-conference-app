import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from '@ionic/angular/standalone';
import { SpeakerService } from  '../../speakers/speaker.service';
import { UtilService } from 'src/app/utils/util-service';
import { type Speaker } from '../../speakers/speaker.model';

@Component({
  selector: 'app-speakers',
  templateUrl: './speakers.page.html',
  styleUrls: ['./speakers.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton]
})
export class SpeakersPage implements OnInit {
  @ViewChild('speakerInput') speakerInput!: any;
  
  private readonly speakerService = inject(SpeakerService);
  private readonly utilService = inject(UtilService);
  private speakerArray: Speaker[] = [];

  protected speakers: Speaker[] = [];

  constructor() { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.speakers = await this.speakerService.getSpeakers();
  }

  public async importSpeakers() {
    const speakerArray: Speaker[] = [];
    const file = this.speakerInput.nativeElement.files[0];
    console.log('Importing speakers from file:', file);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      console.log('File content:', e.target.result);
      if (!e.target.result) return;
      const data = e.target.result as string;
      let csvToRowArray = data.split("\n");
      for (let index = 1; index < csvToRowArray.length - 1; index++) {
        let row = this.utilService.CSVtoArray(csvToRowArray[index]) as string[];
        const speaker: Speaker = {
          id: row[0],
          firstname: row[1],
          lastname: row[2],
          title: row[3],
          mvp: row[4].toLowerCase() === 'true',
          cta: row[5].toLocaleLowerCase() === 'true',
          linkedInUrl: row[6],
          trailblazerUrl: row[7],
          bio: row[8]
        }
        speakerArray.push(speaker);
      }
      console.log(speakerArray);
      await this.speakerService.upsertSpeakers(speakerArray);
    };
    reader.readAsText(file);
    this.speakerInput.nativeElement.value = '';
  }

}
