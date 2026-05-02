import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from '@ionic/angular/standalone';
import { tabletojson } from 'tabletojson';
import { SessionService } from '../../session/session.service'
import { SpeakerService } from  '../../speakers/speaker.service';
import { UtilService } from 'src/app/utils/util-service';
import { SessionStatus, type Session,  SessionFormat } from '../../session/session.model';
import { type Speaker } from '../../speakers/speaker.model';

const SESSION_XLS_COLUMN_MAP: any = {
  'id': 'Session: ID',
  'title': 'Presentation Title',
  'abstract': 'Presentation Abstract',
  'speaker': 'Speaker',
  'speaker2': '2nd Speaker',
  'room': 'Room',
  'isWorkshop': 'Hands-on Workshop',
  'time': 'Time Slot',
  'isAi': 'AI/Agentforce',
  'isDataCloud': 'Data Cloud',
  'isFlow': 'Flow',
  'isIntegrations': 'Integrations/APIs',
  'isHardSkills': 'Soft Skills',
  'isSlack': 'Slack'
}



@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.page.html',
  styleUrls: ['./sessions.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton]
})
export class SessionsPage implements OnInit {
  @ViewChild('sessionInput') sessionInput!: any;
  
  private readonly sessionService = inject(SessionService);
  private readonly utilService = inject(UtilService);
  private readonly speakerService = inject(SpeakerService);
  private sessionArray: Session[] = [];

  protected sessions: Session[] = [];

  constructor() { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.sessions = await this.sessionService.getSessions();
  }

  public async importSessions() {
    const allSpeakers = await this.speakerService.getSpeakers();
    const sessionArray: Session[] = [];
    const file = this.sessionInput.nativeElement.files[0];
    console.log('Importing sessions from file:', file);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      // console.log('File content:', e.target.result);
      if (!e.target.result) return;
      const data = e.target.result as string ?? '';

      const converted = tabletojson.convert(data)[0];
      console.log('Converted CSV to JSON:', converted.length, 'rows');

      for (let index = 0; index < converted.length; index++) {
        // let row = this.utilService.CSVtoArray(converted[index]) as string[];
        let row = converted[index];
        // console.log('Processing row:', row);
        if (row) {
          const speaker1Name = (row[SESSION_XLS_COLUMN_MAP.speaker] ?? '').split(/ (.*)/);
          console.log('Speaker 1 name:', speaker1Name);
          const speaker2Name = (row[SESSION_XLS_COLUMN_MAP.speaker2]?? '').split(/ (.*)/);
          let speakers: {id: string, name: string}[] = [];
          if (speaker1Name) {
            const speaker1 = allSpeakers.find((s: any) => s.firstname === speaker1Name[0].trim() && s.lastname === speaker1Name[1].trim());
            if (speaker1) {
              speakers.push({
                id: speaker1.id,
                name: speaker1.firstname + ' ' + speaker1.lastname,
              });
            }
          }

          if (speaker2Name) {
            const speaker2 = allSpeakers.find((s: any) => s.firstname === speaker2Name[0].trim() && s.lastname === speaker2Name[1].trim());
            if (speaker2) {
              speakers.push({
                id: speaker2.id,
                name: speaker2.firstname + ' ' + speaker2.lastname,
              });
            }
          }
          console.log("speakers", speakers );
          const startTime = row[SESSION_XLS_COLUMN_MAP.time].split('-')[0].trim();
          const startDateTime = new Date(`2026-06-05T${startTime}:00+01:00`).getTime() / 1000;;
          const endTime = row[SESSION_XLS_COLUMN_MAP.time].split('-')[1].trim();
          const endDateTime = new Date(`2026-06-05T${endTime}:00+01:00`).getTime()/1000;
          const session: Session = {
            id: row[SESSION_XLS_COLUMN_MAP.id],
            title: row[SESSION_XLS_COLUMN_MAP.title],
            abstract: row[SESSION_XLS_COLUMN_MAP.abstract],
            room: row[SESSION_XLS_COLUMN_MAP.room],
            startDateTime: {seconds: startDateTime},
            endDateTime: {seconds: endDateTime},
            status: SessionStatus.Published,
            speakers: speakers,
            format: row[SESSION_XLS_COLUMN_MAP.isWorkshop] === '1' ? SessionFormat.Workshop : SessionFormat.Session,
            tags: []
          }
          if (row[SESSION_XLS_COLUMN_MAP.isAi] === '1') {
            session.tags?.push('AI');
          }
          if (row[SESSION_XLS_COLUMN_MAP.isDataCloud] === '1') {
            session.tags?.push('Data Cloud');
          }
          if (row[SESSION_XLS_COLUMN_MAP.isFlow] === '1') {
            session.tags?.push('Flow');
          }
          if (row[SESSION_XLS_COLUMN_MAP.isIntegrations] === '1') {
            session.tags?.push('Integrations');
          }
          if (row[SESSION_XLS_COLUMN_MAP.isHardSkills] === '1') {
            session.tags?.push('Hard Skills');
          }
          if (row[SESSION_XLS_COLUMN_MAP.isSlack] === '1') {
            session.tags?.push('Slack');
          }          
          sessionArray.push(session);
        }
      }
      console.log(sessionArray);
      await this.sessionService.upsertSessions(sessionArray);
    };
    reader.readAsText(file);
    this.sessionInput.nativeElement.value = '';
  }


  private getCsvColCount(csv: string): number {
    const lines = csv.split("\n");
    if (lines.length > 0) {
      const firstLine = lines[0];
      const columns = this.utilService.CSVtoArray(firstLine) as string[];
      return columns.length;
    }
    return 0;
  }
  
}
