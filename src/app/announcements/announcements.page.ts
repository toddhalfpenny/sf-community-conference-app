import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButtons, IonContent, IonItem, IonHeader, IonLabel, IonMenuButton, IonTitle, IonToolbar, IonList, IonModal, IonButton } from '@ionic/angular/standalone';
import { type Announcement } from './announcement.model';
import { AnnouncementService } from './annoucement-service';
import { Subscription } from 'rxjs';

const LOG_TAG = 'announcements.page';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.page.html',
  styleUrls: ['./announcements.page.scss'],
  standalone: true,
  imports: [IonButtons, IonContent, IonItem, IonHeader, IonLabel, IonMenuButton, IonTitle, IonToolbar, CommonModule, FormsModule, IonList, IonModal, IonButton]
})
export class AnnouncementsPage implements OnInit {
  private readonly announcementService = inject(AnnouncementService);
  private announcementSubscription!: Subscription;

  protected announcements: Announcement[] = [];
  protected isAnnouncementModalOpen: boolean = false;
  protected selectedAnnouncement?: Announcement;

  constructor() {
    this.announcementSubscription = this.announcementService.announcements$.subscribe((announcements: Announcement[]) => {
      // console.log(LOG_TAG, 'Announcements updated', announcements);
      this.announcements = announcements;
    });
   }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.announcementService.getAnnouncements();
  }

  onDestroy() {
    if (this.announcementSubscription) {
      this.announcementSubscription.unsubscribe();
    }
  }

  protected openAnnouncement(announcement: Announcement) {
    announcement.isRead = true;
    this.selectedAnnouncement = announcement;
    this.isAnnouncementModalOpen = true;
    this.announcementService.markAsRead(announcement);
  }
  

}
