import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonButton, IonSearchbar, IonItem, IonText, IonButtons, IonMenuButton, IonLoading } from '@ionic/angular/standalone';
import { UserService } from  '../../user/user.service';
import { UtilService } from 'src/app/utils/util-service';
import { UserType, type User } from '../../user/user.model';
import { tabletojson } from 'tabletojson';

const ATTENDEE_TABLE_COLUMN_MAP: any = {
  'id': 'Attendee no.',
  'firstname': 'First Name',
  'lastname': 'Surname',
  'jobtitle': 'Job title',
  'country': 'Work Country',
  'email': 'Email',
  'ticketType': 'Ticket type',
  'company': 'Company',
  'telephone': 'Phone number',
}

@Component({
  selector: 'app-attendees',
  templateUrl: './attendees.page.html',
  styleUrls: ['./attendees.page.scss'],
  standalone: true,
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonList, IonButton, IonSearchbar, IonItem, IonText, IonButtons, IonMenuButton, IonLoading]
})
export class AttendeesPage implements OnInit {
  @ViewChild('attendeeInput') attendeeInput!: any;
  
  private readonly attendeeService = inject(UserService);
  private readonly utilService = inject(UtilService);
  private attendeeArray: User[] = [];

  protected attendees: User[] = [];
  protected searchTerm : string = '';
  protected showLoading: boolean = false;

  protected importFileHeaderIndexes = {
    attendeeNumber: -1,
    firstName: -1,
    lastName: -1,
    email: -1,
    ticketType: -1,
    company: -1,
    telephone: -1,
    country: -1,
    jobTitle: -1,
  }

  constructor() { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.showLoading = true;
    this.attendees = await this.attendeeService.getUsers();
    this.showLoading = false;
  }


  protected handleSearchChange(event: any) {
    console.log("handleSearchChange", event);
    this.searchTerm = event.detail.value.toLowerCase();
  }

  
  public async importAttendees() {
    const attendeeArray: User[] = [];
    const file = this.attendeeInput.nativeElement.files[0];
    console.log('Importing attendees from file:', file);
    const timeNow= new Date();
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      // console.log('File content:', e.target.result);
      if (!e.target.result) return;
      const data = e.target.result as string;


      const converted = tabletojson.convert(data)[0];
      console.log('Converted table to JSON:', converted.length, 'rows');
      this.setHeaderIndex2(converted[0]);
      console.log('Header indexes set to:', this.importFileHeaderIndexes);

      for (let index = 1; index < converted.length -1; index++) {
        let row = converted[index];
        for (let key in row) {
          if (row[key] === 'Â') {
            row[key] = '';
          }
        }
        if (row && row[3]) {
          const attendee: User = {
            firstname: row[this.importFileHeaderIndexes.firstName],
            lastname: row[this.importFileHeaderIndexes.lastName],
            email: row[this.importFileHeaderIndexes.email],
            type: this.getType(row[this.importFileHeaderIndexes.ticketType]),
            id: row[this.importFileHeaderIndexes.attendeeNumber],
            company: row[this.importFileHeaderIndexes.company] ?? "",
            telephone: row[this.importFileHeaderIndexes.telephone] ?? "",
            companyCountry: row[this.importFileHeaderIndexes.country] ?? "",
            jobTitle: row[this.importFileHeaderIndexes.jobTitle] ?? "",
            lastModified: timeNow,
          }
          if (attendee.type !== UserType.PayItForward) {
            attendeeArray.push(attendee);
          }
        }
      }
      console.log(attendeeArray);
      await this.attendeeService.upsertUsers(attendeeArray);
    };
    reader.readAsText(file, 'ISO-8859-4');
    this.attendeeInput.nativeElement.value = '';
  }

  private getType(ticketType: string): UserType {
    switch (ticketType.toLowerCase()) {
      case 'organiser':
        return UserType.Admin;
      case 'speaker':
        return UserType.Speaker;
      case 'sponsor':
      // case 'sponsor General Admission':
        return UserType.Sponsor;
      case 'Pay':
        return UserType.PayItForward;
      default:
        return UserType['Attendee-InPerson']
    }
  }

  private setHeaderIndex2(headerRow: any = {}) {
    console.log('Setting header indexes from row:', headerRow);
    for (let key of Object.keys(headerRow)) {
      console.log(`Processing header column: ${headerRow[key]} at index ${key}`);
      switch (headerRow[key].toLowerCase()) {
        case 'attendee #' :
          this.importFileHeaderIndexes.attendeeNumber  = parseInt(key);
          break;
        case 'first name' :
          this.importFileHeaderIndexes.firstName  = parseInt(key);
          break;
        case 'last name' :
          this.importFileHeaderIndexes.lastName  = parseInt(key);
          break;
        case 'email' :
          this.importFileHeaderIndexes.email  = parseInt(key);
          break;
        case 'ticket type' :
          this.importFileHeaderIndexes.ticketType  = parseInt(key);
          break;
        case 'company' :
          this.importFileHeaderIndexes.company  = parseInt(key);
          break;
        case 'phone number' :
          this.importFileHeaderIndexes.telephone  = parseInt(key);
          break;
        case 'work country' :
          this.importFileHeaderIndexes.country  = parseInt(key);
          break;
        case 'job title' :
          this.importFileHeaderIndexes.jobTitle  = parseInt(key);
          break;          
      }
    }
  }
}
