/** 
 * SpeakerPage
 * 
 * TODO
 * - Always load speaker from server
 */
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule,Validators } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { IonAlert, IonContent, IonHeader, IonTitle, IonToggle, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon, IonCard, IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonLabel, IonTextarea } from '@ionic/angular/standalone';
import { create, close, save } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { SpeakerService } from  '../../speakers/speaker.service';
import { Speaker, SpeakerStatus } from '../../speakers/speaker.model'
import { SessionService } from 'src/app/session/session.service';
import { Session } from 'src/app/session/session.model';
import { first, last } from 'rxjs';

@Component({
  selector: 'app-speaker',
  templateUrl: './speaker.page.html',
  styleUrls: ['./speaker.page.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, IonAlert, IonContent, IonHeader, IonTitle, IonToggle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonButton, IonIcon, IonCard, IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonLabel, IonTextarea]
})
export class SpeakerPage implements OnInit {

  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly speakerService = inject(SpeakerService);
  private readonly sessionService = inject(SessionService);
  private readonly location = inject(Location);

  protected speaker: Speaker | null = null;
  protected isEditing: boolean = false;
  protected isFailedSaveAlertOpen: boolean = false;
  protected isNewSpeaker: boolean = false;
  protected speakerForm: FormGroup = this.formBuilder.group({
    firstname: [{value: ''}, Validators.required],
    lastname: [{value: ''}, Validators.required],
    linkedInUrl: [{value: ''}],
    trailblazerUrl: [{value: ''}],
    bio: [{value: ''}],
    mvp: [{value: false}],
    cta: [{value: false}],
    status: [],
  });
  protected SpeakerStatusOptions = [
    { value: SpeakerStatus.Draft, label: 'Draft' },
    { value: SpeakerStatus.Published, label: 'Published' }
  ];
  protected sessions!: Session[];

  protected failedSaveAlertMessage: string = 'Failed to save speaker. Please try again.';
  protected failedSaveAlertButtons = [
    {
      text: 'OK',
      role: 'cancel',
      handler: () => {
        console.log('Failed save alert dismissed');
      },
    },
  ];

  constructor() { 
    const navigation = this.router.currentNavigation();
    console.log("Navigation extras:", navigation?.extras);
    if (navigation?.extras?.state) {
      this.speaker = navigation?.extras?.state["speaker"];
    } else {
      this.isNewSpeaker = true;
    }
    console.log("Speaker:", this.speaker);
    addIcons({ close, create, save});

    // Set initial form values based on the speaker data
    this.speakerForm.setValue({ 
      firstname: this.speaker?.firstname ?? '',
      lastname: this.speaker?.lastname ?? '',
      linkedInUrl: this.speaker?.linkedInUrl ?? '',
      trailblazerUrl: this.speaker?.trailblazerUrl ?? '',
      bio: this.speaker?.bio || '',
      mvp: this.speaker?.mvp || false,
      cta: this.speaker?.cta || false,
      status: this.speaker?.status ?? SpeakerStatus.Published,
    });
    console.log("isNew Speaker", this.isNewSpeaker);  
    if(this.isNewSpeaker) {
      this.speakerForm.controls['status'].setValue(SpeakerStatus.Draft);
      // this.speakerForm.get('email')?.enable();
      this.isEditing = true;
    } else {
      // this.speakerForm.get('email')?.disable();
    }
  }

  async ngOnInit() {
    if (this.speaker) {
      this.sessions = await this.sessionService.getSpeakerSessions(this.speaker.id);
    }
  }

  async ionViewWillEnter() {
    // TODO SUBSCRIPTION THIS
    // if (!this.speaker) {
    //   console.log('Fetching speaker for speaker page');
    //   this.speaker = await this.speakerService.getSpeakerById(this.speakerId) as Speaker;
    //   console.log('Speaker in speaker page', this.speaker);
    // } 
    // if (this.speaker) {
    // }
    // this.sponsors = (await this.sponsorService.getRawSponsors()).sort((a, b) => a.name.localeCompare(b.name));
    // if(!this.isNewSpeaker) {
    //   this.eventSpeaker = await this.speakerService.getSpeakerByEmail(this.speaker?.email || '');
    //   if (this.eventSpeaker?.boothStaff) {
    //     this.speakerForm.get('associatedSponsors')?.setValue(this.eventSpeaker.boothStaff);
    //   }
    //   if (this.eventSpeaker?.sponsorAdmin) {
    //     this.speakerForm.get('associatedSponsors')?.setValue(this.eventSpeaker.sponsorAdmin);
    //   }
    // }
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

  protected edit() {
    this.isEditing = true;
    this.speakerForm.enable();
  }

  protected onStatusChange(event:any) {
    console.log('Status changed', event.detail.value);
    this.speakerForm.patchValue({status: event.detail.value});
  }

  protected async save() {
    this.isEditing = false;
    const timeNow= new Date();
    const updatedSpeaker: Speaker = {
      id: this.speaker?.id ?? '',
      firstname: this.speakerForm.value.firstname,
      lastname: this.speakerForm.value.lastname,
      linkedInUrl: this.speakerForm.value.linkedInUrl,
      trailblazerUrl: this.speakerForm.value.trailblazerUrl,
      bio: this.speakerForm.value.bio,
      mvp: this.speakerForm.value.mvp,
      cta: this.speakerForm.value.cta,
      status: this.speakerForm.value.status,
      lastModified: timeNow,
    };
    console.log('Saving speaker:', updatedSpeaker);
    const res = await this.speakerService.upsertSpeakers([updatedSpeaker], true);
    if (res.length > 0) {
      console.error('Error saving speaker:', res);
      this.failedSaveAlertMessage = `Failed to save speaker ${updatedSpeaker.firstname} ${updatedSpeaker.lastname}. ${res[0].error}`;
      this.isFailedSaveAlertOpen = true;
    } else {
      this.router.navigate(['/admin/speakers'], { replaceUrl:true });
    }
  }


}
