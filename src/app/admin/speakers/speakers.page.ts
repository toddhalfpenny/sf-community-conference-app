import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from '@ionic/angular/standalone';
import { tabletojson } from 'tabletojson';
import { SpeakerService } from  '../../speakers/speaker.service';
import { UtilService } from 'src/app/utils/util-service';
import { type Speaker } from '../../speakers/speaker.model';

const SESSION_XLS_COLUMN_MAP: any = {
  'id': 'Contact ID',
  'firstname': 'First Name',
  'lastname': 'Last Name',
  'title': 'Title',
  'mvp': 'MVP',
  'cta': 'CTA',
  'linkedInUrl': 'LinkedIn Address',
  'trailblazerUrl': 'Trailblazer ID',
  'bio': 'Biography',
}

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

      const converted = tabletojson.convert(data)[0];
      console.log('Converted CSV to JSON:', converted.length, 'rows');

      for (let index = 0; index < converted.length; index++) {
        let row = converted[index];
        if (row) {
          const speaker: Speaker = {
            id: row[SESSION_XLS_COLUMN_MAP.id],
            firstname: row[SESSION_XLS_COLUMN_MAP.firstname],
            lastname: row[SESSION_XLS_COLUMN_MAP.lastname],
            title: row[SESSION_XLS_COLUMN_MAP.title],
            mvp: (row[SESSION_XLS_COLUMN_MAP.mvp] ?? '').toLowerCase() === '1',
            cta: (row[SESSION_XLS_COLUMN_MAP.cta] ?? '').toLocaleLowerCase() === '1',
            linkedInUrl: row[SESSION_XLS_COLUMN_MAP.linkedInUrl],
            trailblazerUrl: row[SESSION_XLS_COLUMN_MAP.trailblazerUrl],
            bio: row[SESSION_XLS_COLUMN_MAP.bio],
          }
          speakerArray.push(speaker);
        }
      }
      console.log(speakerArray);
      await this.speakerService.upsertSpeakers(speakerArray);
    };
    reader.readAsText(file);
    this.speakerInput.nativeElement.value = '';
  }

}
