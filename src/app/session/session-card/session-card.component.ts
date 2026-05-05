import { Component, Input, OnInit } from '@angular/core';
import { type Session } from '../session.model';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActionSheetController, IonAvatar, IonChip, IonLabel, IonIcon, IonButton, IonActionSheet } from "@ionic/angular/standalone";
import { close, calendar, shareSocial, time, location, logoGoogle, logoApple, logoMicrosoft } from 'ionicons/icons';
import { addIcons } from 'ionicons';


@Component({
  selector: 'app-session-card',
  templateUrl: './session-card.component.html',
  styleUrls: ['./session-card.component.scss'],
  standalone: true,
  imports: [RouterLink, DatePipe, IonAvatar, IonChip, IonLabel, IonIcon, IonButton]
})
export class SessionCardComponent  implements OnInit {

  @Input({required: true}) session!: Session;
  @Input() showSpeakers: boolean = true;

  protected readonly addToCalendarButtons = [
    {
      text: 'Google Calendar',
      icon: logoGoogle,
      handler: () => {
        this.addToGoogleCalendar();
      }
    },
    {
      text: 'Outlook Calendar',
      icon: logoMicrosoft,
      handler: () => {
        this.addToCalendar();
      }
    },
    {
      text: 'Apple Calendar',
      icon: logoApple,
      handler: () => {
        this.addToCalendar();
      }
    },
    {
      text: 'Cancel',
      icon: 'close',
      role: 'cancel'
    }
  ];  
  constructor(
    private actionSheetCtrl: ActionSheetController
  ) {
    addIcons({ close, calendar, shareSocial, time, location, logoGoogle, logoApple, logoMicrosoft });
  }

  ngOnInit() {}

  protected async showAddToCalendar() {
    console.log('Showing add to calendar options');
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Actions',
      buttons: this.addToCalendarButtons,
    });
    await actionSheet.present();
  }

  private addToGoogleCalendar() {
    // This opens a new event
    // window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text=My+Event&dates=20260510T140000Z/20260510T150000Z&details=Event+description&location=London', '_blank');

    const startTime = new Date(this.session.startDateTime.seconds *1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endTime = new Date(this.session.endDateTime.seconds *1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const speakerStr = `Presented by: ${this.session.speakers.map(s => s.name).join(', ')}`;

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(this.session.title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(speakerStr + '\n' + this.session.abstract)}&location=${encodeURIComponent(this.session.room)}`;

    console.log('Opening Google Calendar URL:', url);
    window.open(url, '_blank');
    

  }

  /** Creates a ics link for a calendar link */
  private addToCalendar() {
    const startTime = new Date(this.session.startDateTime.seconds *1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endTime = new Date(this.session.endDateTime.seconds *1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const speakerStr = `Presented by: ${this.session.speakers.map(s => s.name).join(', ')}`;

    // Example from cactusforce
// BEGIN:VCALENDAR
// VERSION:2.0
// PRODID:-//Cactusforce//Conference App//EN
// BEGIN:VEVENT
// UID:1778014178238-5-Key-Lessons-Learned-from-Reducing-75%-of-Async-Jobs@cactusforce.com
// DTSTAMP:20260505T204938Z
// DTSTART:20260123T160000Z
// DTEND:20260123T165000Z
// SUMMARY:5 Key Lessons Learned from Reducing 75% of Async Jobs
// DESCRIPTION:
// LOCATION:Building 1 | Room 241 | Innovation
// END:VEVENT
// END:VCALENDAR

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LondonsCalling//Conference App//EN
BEGIN:VEVENT
SUMMARY:${this.session.title}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startTime}
DTEND:${endTime}
DESCRIPTION:${this.session.abstract}\n\nPresented by: ${this.session.speakers.map(s => s.name).join(', ')}
LOCATION:${this.session.room}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    console.log('Opening calendar file URL:', url);
    window.open(url, '_blank');

  }

}
