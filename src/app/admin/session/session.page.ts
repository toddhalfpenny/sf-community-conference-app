/**
 * session.page.ts - Page for a single session editing.
 * 
 * TODO
 * - delete 
 */
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon, IonList, IonInput, IonItem, IonTextarea, IonCard, IonLabel, IonText, IonRow, IonCol, IonSelectOption, IonModal } from '@ionic/angular/standalone';
import { create, close, save } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Session, SessionStatus } from '../../session/session.model'
import { SessionService } from '../../session/session.service';
import { SpeakerService } from 'src/app/speakers/speaker.service';
import { TypeaheadComponent } from "src/app/typeahead/typeahead.component";
import { Speaker } from 'src/app/speakers/speaker.model';


@Component({
  selector: 'app-session',
  templateUrl: './session.page.html',
  styleUrls: ['./session.page.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonButton, IonIcon, IonList, IonInput, IonItem, IonTextarea, IonCard, IonLabel, IonSelectOption, IonModal, TypeaheadComponent]
})
export class SessionPage implements OnInit {

  @ViewChild('modal', { static: true }) modal!: IonModal;
  
  private activatedRoute = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly sessionsService = inject(SessionService);
  private readonly speakerService = inject(SpeakerService);
  private readonly formBuilder = inject(FormBuilder);

  protected isEditing: boolean = false;

  protected sessionForm: FormGroup = this.formBuilder.group({
    title: [{value: ''}, Validators.required],
    abstract: [{value: ''}],
    room: [{value: ''}],
    status: [''],
    startTime: [{value: ''}],
    endTime: [{value: ''}],
  });
  protected SessionStatusOptions = [
    { value: SessionStatus.Draft, label: 'Draft' },
    { value: SessionStatus.Published, label: 'Published' }
  ];
  
  protected allSpeakers!: Speaker[];
  protected session!: Session;
  protected selectedSpeakers: any[] = [];
  protected selectedSpeakerIds:string[] = [];


  constructor() {
    addIcons({ close, create, save});
   }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    const sessionId = this.activatedRoute.snapshot.paramMap.get('sessionId') as string;
    this.session = await this.sessionsService.getSessionById(sessionId) as Session;
    const startDateTime = this.session.startDateTime ? new Date(this.session.startDateTime.seconds * 1000) : null;
    const startTime = startDateTime ? `${startDateTime.getHours().toString().padStart(2, '0')}:${startDateTime.getMinutes().toString().padStart(2, '0')}` : '';
    const endDateTime = this.session.endDateTime ? new Date(this.session.endDateTime.seconds * 1000) : null;
    const endTime = endDateTime ? `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}` : '';
    this.sessionForm.setValue({
      title: this.session.title,
      abstract: this.session.abstract ?? '',
      room: this.session.room ?? '',
      status: this.session.status ?? SessionStatus.Draft,
      startTime: startTime,
      endTime: endTime,
    });

    this.modal.showBackdrop
    this.selectedSpeakerIds = this.session.speakers?.map(s => s.id) ?? [];
    this.allSpeakers = await this.speakerService.getSpeakers();
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

  protected async delete() {
  }

  protected edit() {
    this.isEditing = true;
    this.sessionForm.enable();
  }

  protected onStatusChange(event:any) {
    console.log('Status changed', event.detail.value);
    this.sessionForm.patchValue({status: event.detail.value});
  }

  protected async save() {
    this.isEditing = false;
    console.log('Form values', JSON.stringify(this.sessionForm.value));
    const startTime = new Date(`2026-06-05T${this.sessionForm.value.startTime}:00+01:00`).getTime() / 1000;
    const endTime = new Date(`2026-06-05T${this.sessionForm.value.endTime}:00+01:00`).getTime() / 1000;
    const updatedSession: Session = {
      id: this.session?.id ?? '',
      title: this.sessionForm.value.title,    
      abstract: this.sessionForm.value.abstract,
      room: this.sessionForm.value.room,
      status: this.sessionForm.value.status,
      startDateTime: {seconds: startTime},
      // TODO
      // startDateTime: this.session?.startDateTime,
      endDateTime: {seconds: endTime},
      speakers: this.session?.speakers ?? []
    };
    console.log('Saving session:', updatedSession);
    await this.sessionsService.upsertSessions([updatedSession], true);
    this.router.navigate(['/admin/sessions'], { replaceUrl:true });
  }

  protected speakerSelectionChanged(selectedSpeakers: string[]) {
    console.log('Selected speakers:', selectedSpeakers);
    this.session.speakers = this.allSpeakers.filter(s => selectedSpeakers.includes(s.id)).map(s => ({id: s.id, name: `${s.firstname} ${s.lastname}`}));
    this.selectedSpeakerIds = this.session.speakers?.map(s => s.id) ?? [];
    this.modal.dismiss();
  }
}
