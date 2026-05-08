import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from '@ionic/angular/standalone';
import { tabletojson } from 'tabletojson';
import { UserService } from  '../../user/user-service';
import { UtilService } from 'src/app/utils/util-service';
import { UserType, type User } from '../../user/user.model';

@Component({
  selector: 'app-attendees',
  templateUrl: './attendees.page.html',
  styleUrls: ['./attendees.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton]
})
export class AttendeesPage implements OnInit {
  @ViewChild('attendeeInput') attendeeInput!: any;
  
  private readonly attendeeService = inject(UserService);
  private readonly utilService = inject(UtilService);
  private attendeeArray: User[] = [];

  protected attendees: User[] = [];

  constructor() { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    // this.attendees = await this.attendeeService.getUsers();
  }

  public async importAttendees() {
    const attendeeArray: User[] = [];
    const file = this.attendeeInput.nativeElement.files[0];
    console.log('Importing attendees from file:', file);
    const timeNow= new Date();
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      console.log('File content:', e.target.result);
      if (!e.target.result) return;
      const data = e.target.result as string;

      let csvToRowArray = data.split("\n");
      for (let index = 1; index < csvToRowArray.length; index++) {
        let row = this.utilService.CSVtoArray(csvToRowArray[index]) as string[];
        console.log('Processing row:', row);
        if (row && row[3]) {
          const attendee: User = {
            firstname: row[0],
            lastname: row[1],
            email: row[2],
            type: this.getType(row[3]),
            id: row[4],
            company: row[5],
            lastModified: timeNow,
          }
          attendeeArray.push(attendee);
        }
      }
      console.log(attendeeArray);
      await this.attendeeService.upsertUsers(attendeeArray);
    };
    reader.readAsText(file, 'ISO-8859-4');
    this.attendeeInput.nativeElement.value = '';
  }

  private getType(ticketType: string): UserType {
    switch (ticketType) {
      case 'Organisers':
        return UserType.Admin;
      case 'Speakers':
        return UserType.Speaker;
      case 'Sponsors':
      case 'Sponsor General Admission':
        return UserType.Sponsor;
      default:
        return UserType['Attendee-InPerson']
    }
  }
}
