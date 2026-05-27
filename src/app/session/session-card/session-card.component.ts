import { Component, EventEmitter, inject, input, Input, OnInit, Output } from '@angular/core';
import { type Session } from '../session.model';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActionSheetController, IonAvatar, IonChip, IonLabel, IonIcon, IonButton } from "@ionic/angular/standalone";
import { close, calendar, heart, heartOutline, shareSocial, time, location, logoGoogle, logoApple, logoMicrosoft } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { User, UserType } from 'src/app/user/user.model';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-session-card',
  templateUrl: './session-card.component.html',
  styleUrls: ['./session-card.component.scss'],
  standalone: true,
  imports: [RouterLink, DatePipe, IonAvatar, IonChip, IonLabel, IonIcon, IonButton]
})
export class SessionCardComponent  implements OnInit {

  @Input({required: true}) session!: Session;
  @Input() favourites: string[] | undefined = [];
  @Input() isSessionPage: boolean = false;
  @Input() user: User | null = null;
  @Input() showSpeakers: boolean = true;
  @Output() favouriteToggled = new EventEmitter<{sessionId:string, isFavourite: boolean}>();

  private sanitizer = inject(DomSanitizer);


  protected isFavourite: boolean  = false;
  protected shouldShowStream: boolean = false;
  protected streamEmbedCode: any = '';

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
    addIcons({ close, calendar, heart, heartOutline, shareSocial, time, location, logoGoogle, logoApple, logoMicrosoft });
  }

  ngOnInit() {
    this.isFavourite = this.favourites ? this.favourites.includes(this.session.id!) : false;
    this.calculateShouldShowStream();
  }

  protected async showAddToCalendar(event: any) {
    event.stopPropagation();
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

  protected shareSession(event: any) {
    event.stopPropagation();
    const shareData = {
      title: this.session.title,
      text: `${this.session.title} - ${this.session.abstract}\n\nPresented by: ${this.session.speakers.map(s => s.name).join(', ')}`,
      url: `${this.session.shareLink ? this.session.shareLink : 'https://londonscalling.net/schedule'}`
    };
    if (navigator.share) {
      navigator.share(shareData).then(() => {
        console.log('Session shared successfully');
      }).catch((error) => {
        console.error('Error sharing session:', error);
      });
    } else {
      // Fallback for browsers that do not support the Web Share API
      if (navigator.clipboard) {
        const sessionDetails = `${this.session.shareLink ? this.session.shareLink : 'https://londonscalling.net/schedule'}`
        navigator.clipboard.writeText(sessionDetails).then(() => {
          alert('Session URL copied to clipboard. You can now share it manually!');
        }).catch((error) => {
          console.error('Error copying session details to clipboard:', error);
          alert('Unable to copy session details to clipboard. Please copy them manually:\n\n' + sessionDetails);
        });
        return;
      }
    }
  }

  protected toggleFavourite(event: any) {
    event.stopPropagation();
    console.log('Toggling favourite for session', this.session.id);
      this.isFavourite = !this.isFavourite;
      this.favouriteToggled.emit({sessionId: this.session.id, isFavourite: this.isFavourite});
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

  private calculateShouldShowStream(): boolean {
    const nowSeconds = new Date().valueOf() / 1000;
    // console.log('Calculating whether to show live stream for session', this.session.title, this.user);
    if (!this.isSessionPage || !this.session.liveStreamLink) {
      return false;
    }
    if (!this.user || this.user.type === UserType.Guest) {
      return false;
    }
    if (this.user?.type === UserType.Admin || this.user?.type === UserType['Super-Admin']) {
      this.shouldShowStream = true;
    }
    // Show stream 15 minutes before and after the session
    if (this.session.startDateTime.seconds - 15*60 < nowSeconds && this.session.endDateTime.seconds + 15*60 > nowSeconds) {
      this.shouldShowStream = true;
    }

    if (this.shouldShowStream) {
      if (this.session.liveStreamLink.includes("youtube")) {
        this.streamEmbedCode = this.sanitizer.bypassSecurityTrustHtml(`<iframe width="100%" height="315" src="${this.session.liveStreamLink}" frameborder="0" allowfullscreen style="width:100%;min-height:300px"></iframe>`);
      } else if (this.session.liveStreamLink.includes("vimeo")) {
        this.streamEmbedCode = this.sanitizer.bypassSecurityTrustHtml(`<iframe src="${this.session.liveStreamLink}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="width:100%;min-height:300px"></iframe>`);
      } else {
        // console.error('Unknown live stream platform for link', this.session.liveStreamLink);
        // this.shouldShowStream = false;
        this.streamEmbedCode = this.sanitizer.bypassSecurityTrustHtml(`<iframe src="${this.session.liveStreamLink}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="width:100%;min-height:300px"></iframe>`);
      }
    }
    return false;
  }

}
