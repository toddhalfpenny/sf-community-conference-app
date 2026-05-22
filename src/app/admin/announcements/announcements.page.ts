import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonList, IonItem, IonLabel, IonMenuButton } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { AnnouncementService } from 'src/app/announcements/annoucement-service';
import { type Announcement } from 'src/app/announcements/announcement.model';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.page.html',
  styleUrls: ['./announcements.page.scss'],
  standalone: true,
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonButton, IonList, IonItem, IonLabel, IonMenuButton]
})
export class AnnouncementsPage implements OnInit {
  private readonly announcementService = inject(AnnouncementService); 

  protected announcements: Announcement[] = [];

  constructor() { }

  ngOnInit() {
  }


  async ionViewWillEnter() {
    this.announcements = await this.announcementService.getAllAnnouncements();
  }

}
