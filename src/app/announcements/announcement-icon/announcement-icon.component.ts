import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { IonButton, IonIcon } from "@ionic/angular/standalone";
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { notifications, notificationsOutline }from 'ionicons/icons';
import { AnnouncementService } from '../annoucement-service';
import { type Announcement } from '../announcement.model';
import { User } from 'src/app/user/user.model'; 
import { UserService } from 'src/app/user/user.service';
import { Subscription } from 'rxjs';

const LOG_TAG = 'announcement-icon.component';

@Component({
  selector: 'app-announcement-icon',
  templateUrl: './announcement-icon.component.html',
  styleUrls: ['./announcement-icon.component.scss'],
  imports: [IonButton, IonIcon, RouterLink],
})
export class AnnouncementIconComponent  implements OnInit, OnDestroy {
  private readonly announcementService = inject(AnnouncementService);
  private announcementSubscription!: Subscription;
  private readonly userService = inject(UserService);
  private userSubscription!: Subscription;
  

  protected hasUnreadAnnouncements: boolean = false;
  protected shouldShow: boolean = false;

  constructor() {
    this.userSubscription = this.userService.user$.subscribe((user: User | null) => {
      if (user) {
        this.shouldShow = true;
        if (!this.announcementSubscription) {
          console.log(LOG_TAG, 'Subscribing to announcements for user', user);
          addIcons({ notifications, notificationsOutline });
          this.announcementSubscription = this.announcementService.announcements$.subscribe((announcements: Announcement[]) => {
            console.log(LOG_TAG, 'Announcements updated', announcements);
            let anyUnread = false;
            announcements.forEach(announcement => {
              if (!announcement.isRead) {
                anyUnread = true;
              }
            });
            this.hasUnreadAnnouncements = anyUnread;
          });
          this.announcementService.getAnnouncements();
        }
      }      
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    if (this.announcementSubscription) {
      this.announcementSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

}
