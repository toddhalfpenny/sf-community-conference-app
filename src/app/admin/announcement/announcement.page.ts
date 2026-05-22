import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCardHeader, IonCardTitle, IonButtons, IonBackButton, IonButton, IonInput, IonIcon, IonCard, IonCardContent, IonItem, IonTextarea, IonToggle, IonDatetimeButton, IonModal, IonDatetime, IonLabel, IonSelectOption } from '@ionic/angular/standalone';
import { create, close, save, trash, options, notifications } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import { AnnouncementService } from 'src/app/announcements/annoucement-service';
import { Announcement, AnnouncementType } from 'src/app/announcements/announcement.model';
import { Title } from 'chart.js';

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.page.html',
  styleUrls: ['./announcement.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonCardHeader,
    IonCardTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonInput, IonIcon,
    IonCard,
    IonCardContent,
    IonItem, IonTextarea, IonToggle,
    IonDatetimeButton,
    IonModal,
    IonDatetime,
    IonLabel,
    IonSelectOption
],
})
export class AnnouncementPage implements OnInit {
  private readonly location = inject(Location);
  private readonly AnnouncementService = inject(AnnouncementService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected isEditing: boolean = false;
  protected isNewAnnouncement: boolean = false;

  protected announcement!: Announcement;

  protected announcementForm: FormGroup = this.formBuilder.group({
    title: [{ value: '' }, Validators.required],
    content: [{ value: '' }, Validators.required],
    target: [{ value: [0] }, Validators.required],
    notificationTime: [{ value: '' }, Validators.required],
    type: [{ value: 0 }, Validators.required],
    isActive: [false, Validators.required], // Add the isActive field
  });

  protected NotificationTypeOptions = [
    { value: AnnouncementType.Announcement, label: 'Announcement' },
    { value: AnnouncementType.Config, label: 'Config' }
  ];

  constructor() {
    addIcons({ create, close, save, trash });
    const navigation = this.router.currentNavigation();
    console.log('Navigation extras:', navigation?.extras);
    if (navigation?.extras?.state) {
      this.announcement = navigation?.extras?.state['announcement'];
      console.log('Announcement:', this.announcement);
    } else {
      this.isNewAnnouncement = true;
      // Initialize a new announcement object if needed
      this.announcement = {
        id: null,
        title: '',
        content: '',
        notificationTime: { seconds: new Date().valueOf() / 1000 },
        type: 0,
        target: [0],
        isActive: false,
      };
    }

    this.announcementForm.setValue(
      {
        title: this.announcement.title,
        content: this.announcement.content,
        target: this.announcement.target,
        notificationTime: this.announcement.notificationTime ? new Date(this.announcement.notificationTime.seconds * 1000).toISOString().slice(0, 16) : '',
        type: this.announcement.type,
        isActive: this.announcement.isActive || false, // Set initial value for isActive
      } 
    );

   
  }

  async ngOnInit() {
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

  protected async delete() {}

  protected edit() {
    this.isEditing = true;
    this.announcementForm.enable();
  }

  protected onTypeChange(event: any) {
    console.log('Type changed', event.detail.value);
    this.announcementForm.patchValue({ type: event.detail.value });
  }

  protected async save() {
    this.isEditing = false;
    const updatedAnnouncement = {
      ...this.announcement,
      title: this.announcementForm.value.title,
      content: this.announcementForm.value.content,
      target: this.announcementForm.value.target,
      notificationTime: { seconds: new Date(this.announcementForm.value.notificationTime).getTime() / 1000 },
      type: this.announcementForm.value.type,
      isActive: this.announcementForm.value.isActive, // Update the isActive flag
    };
  
    console.log('Saving announcement:', updatedAnnouncement);
    await this.AnnouncementService.upsertAnnouncements([updatedAnnouncement]); // Save the updated announcement
    this.router.navigate(['/admin/announcements'], { replaceUrl: true });
  }
}
