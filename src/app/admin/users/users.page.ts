import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from '@ionic/angular/standalone';
import { tabletojson } from 'tabletojson';
import { UserService } from  '../../user/user-service';
import { UtilService } from 'src/app/utils/util-service';
import { UserType, type User } from '../../user/user.model';

const USER_XLS_COLUMN_MAP: any = {
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
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton]
})
export class UsersPage implements OnInit {
  @ViewChild('userInput') userInput!: any;
  
  private readonly userService = inject(UserService);
  private readonly utilService = inject(UtilService);
  private userArray: User[] = [];

  protected users: User[] = [];

  constructor() { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    // this.users = await this.userService.getUsers();
  }

  public async importUsers() {
    const userArray: User[] = [];
    const file = this.userInput.nativeElement.files[0];
    console.log('Importing users from file:', file);
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
          const user: User = {
            firstname: row[0],
            lastname: row[1],
            email: row[2],
            type: this.getType(row[3]),
            company: row[4],
          }
          userArray.push(user);
        }
      }
      console.log(userArray);
      await this.userService.upsertUsers(userArray);
    };
    reader.readAsText(file, 'ISO-8859-4');
    this.userInput.nativeElement.value = '';
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
